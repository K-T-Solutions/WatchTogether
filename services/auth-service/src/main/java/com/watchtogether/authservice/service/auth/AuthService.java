package com.watchtogether.authservice.service.auth;

import com.watchtogether.authservice.entity.AuthCredentialsEntity;
import com.watchtogether.authservice.event.UserRegisteredEvent;
import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.exception.UserNotFoundException;
import com.watchtogether.authservice.kafka.KafkaProducer;
import com.watchtogether.authservice.repository.AuthCredentialsRepository;
import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import com.watchtogether.authservice.request.VerificationRequest;
import com.watchtogether.authservice.response.AuthenticationResponse;
import com.watchtogether.authservice.security.jwt.JwtUtils;
import com.watchtogether.authservice.service.Otp.IOtpService;
import com.watchtogether.authservice.service.credentials.ICredentialsService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService implements IAuthService { //TODO: add change password function
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthCredentialsRepository repository;
    private final KafkaProducer kafkaProducer;
    private final IOtpService otpService;
    private final ICredentialsService credentialsService;

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

    public AuthenticationResponse login(LoginRequest request) {
        var user = repository.findByLoginOrEmail(request.getLogin(), request.getLogin())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password")); //TODO: должно бросаться исключение не найден пользователь

        // TODO: Здесь можно добавить проверку на блокировку пользователя

        if (user.getTwoFactorAuth() != null && user.getTwoFactorAuth().isEnabled()) {
            otpService.initiate2FAVerification(user.getEmail());
            return AuthenticationResponse.twoFactorRequired();
        } else {
            String token = jwtUtils.generateJwtToken(user.getId(), user.getLogin());
            return AuthenticationResponse.success(token);
        }
    }

    public AuthenticationResponse verifyCode(VerificationRequest request) {
        var user = repository.findByLoginOrEmail(request.getLogin(), request.getLogin())
                .orElseThrow(() ->
                        new UserNotFoundException("User with login " + request.getLogin() + "not found.")); //TODO: это бросает исключение

        boolean isCodeValid = otpService.validateOtp(user.getEmail(), request.getCode());

        if (!isCodeValid) {
            throw new BadCredentialsException("Invalid code"); //TODO: change
        }

        String token = jwtUtils.generateJwtToken(user.getId(), user.getLogin());
        return AuthenticationResponse.success(token);
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
