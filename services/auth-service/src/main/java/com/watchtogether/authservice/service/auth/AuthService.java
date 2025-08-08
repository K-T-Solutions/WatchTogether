package com.watchtogether.authservice.service.auth;

import com.watchtogether.authservice.entity.AuthCredentialsEntity;
import com.watchtogether.authservice.event.UserRegisteredEvent;
import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.kafka.KafkaProducer;
import com.watchtogether.authservice.repository.AuthCredentialsRepository;
import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import com.watchtogether.authservice.request.VerificationRequest;
import com.watchtogether.authservice.response.AuthenticationResponse;
import com.watchtogether.authservice.security.jwt.JwtUtils;
import com.watchtogether.authservice.service.Otp.IOtpService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class AuthService implements IAuthService { //TODO: add change password function
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final AuthCredentialsRepository repository;
    private final KafkaProducer kafkaProducer;
    private final IOtpService otpService;

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

//    @Override
//    public Optional<String> authenticate(LoginRequest request) {
//        Optional<String> token;
//        token = repository.findByLoginOrEmail(request.getLogin(), request.getLogin()) //TODO: сюда добавить проверку не блокнту ли пользователь и бросать exception
//                .filter(u -> passwordEncoder.matches(
//                        request.getPassword(),
//                        u.getPasswordHash()))
//                .map(u -> jwtUtils.generateJwtToken(
//                        u.getId(),
//                        u.getLogin())); //TODO: check here + add exception
//
//        return token;
//    }
//
//    public Optional<String> login(LoginRequest request) {
//        Optional<String> token;
//        var userEntity =  repository.findByLoginOrEmail(request.getLogin(), request.getLogin())
//                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash())).orElseThrow();
//
//        if (userEntity.getTwoFactorAuth().isEnabled()) {
//            otpService.sendLoginVerificationCode(userEntity.getEmail());
//        }
//
//    }

    public AuthenticationResponse login(LoginRequest request) {
        // 1. Находим пользователя и проверяем пароль. Если что-то не так - бросаем исключение.
        var user = repository.findByLoginOrEmail(request.getLogin(), request.getLogin())
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password")); //TODO: должно бросаться исключение не найден пользователь

        // TODO: Здесь можно добавить проверку на блокировку пользователя

        // 2. Проверяем, включена ли у него 2FA
        if (user.getTwoFactorAuth() != null && user.getTwoFactorAuth().isEnabled()) {
            // Да, включена. Генерируем и отправляем код.
            otpService.initiateVerification(user.getEmail()); // Используем более удачное название из прошлого ответа
            // Возвращаем ответ, который говорит фронтенду "Покажи поле для ввода кода"
            return AuthenticationResponse.twoFactorRequired();
        } else {
            // Нет, 2FA выключена. Сразу генерируем токен.
            String token = jwtUtils.generateJwtToken(user.getId(), user.getLogin());
            // Возвращаем ответ с токеном
            return AuthenticationResponse.success(token);
        }
    }

    /**
     * Шаг 2: Проверка OTP и финальная аутентификация.
     * Возвращает токен в случае успеха.
     */
    public AuthenticationResponse verifyCode(VerificationRequest request) {
        // 1. Проверяем OTP
        boolean isCodeValid = otpService.validateOtp(request.getLogin(), request.getCode());

        if (!isCodeValid) {
            throw new BadCredentialsException("Invalid code"); //TODO: change
        }

        // 2. Если код верный, снова находим пользователя (для безопасности) и генерируем токен
        var user = repository.findByLoginOrEmail(request.getLogin(), request.getLogin())
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));

        String token = jwtUtils.generateJwtToken(user.getId(), user.getLogin());

        // 3. Возвращаем финальный ответ с токеном
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
