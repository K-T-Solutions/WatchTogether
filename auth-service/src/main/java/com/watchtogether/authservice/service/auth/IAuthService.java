package com.watchtogether.authservice.service.auth;

import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface IAuthService {
    @Transactional
    void registerUser(RegisterRequest request);

    Optional<String> authenticate(LoginRequest request);

    boolean validateToken(String token);
}
