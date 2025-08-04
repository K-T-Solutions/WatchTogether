package com.watchtogether.authservice.service.auth;

import com.watchtogether.authservice.entity.AuthCredentialsEntity;
import com.watchtogether.authservice.event.UserRegisteredEvent;
import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.kafka.KafkaProducer;
import com.watchtogether.authservice.repository.AuthCredentialsRepository;
import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import com.watchtogether.authservice.security.jwt.JwtUtils;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AuthService implements IAuthService { //TODO: add change password function
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthCredentialsRepository repository;
    private final KafkaProducer kafkaProducer;

    @Transactional
    @Override
    public void registerUser(RegisterRequest request) {

        if (repository.existsByLogin(request.getLogin())) {
            throw new LoginAlreadyTakenException("This login already exists");
        } else if (repository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyTakenException("This email already exists");
        }

        AuthCredentialsEntity user = new AuthCredentialsEntity();

        user.setLogin(request.getLogin());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        AuthCredentialsEntity savedUser = repository.save(user);

        UserRegisteredEvent event = UserRegisteredEvent.builder()
                .userId(savedUser.getId())
                .login(savedUser.getLogin())
                .email(savedUser.getEmail())
                .build();

        kafkaProducer.sendRegisterEvent(event); //TODO: добавить проверки чтобы при успешной регистарции отправлялось
    }

    @Override
    public Optional<String> authenticate(LoginRequest request) {
        Optional<String> token;
        token = repository.findByLoginOrEmail(request.getLogin(), request.getLogin()) //TODO: сюда добавить проверку не блокнту ли пользователь и бросать exception
                .filter(u -> passwordEncoder.matches(
                        request.getPassword(),
                        u.getPasswordHash()))
                .map(u -> jwtUtils.generateJwtToken(
                        u.getId(),
                        u.getLogin())); //TODO: check here + add exception

        return token;
    }

    @Override
    public boolean validateToken(String token) {
        try {
            jwtUtils.validateJwtToken(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

}
