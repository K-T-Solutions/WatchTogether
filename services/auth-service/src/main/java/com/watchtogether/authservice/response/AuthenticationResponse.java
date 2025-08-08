package com.watchtogether.authservice.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AuthenticationResponse {
    private boolean twoFactorEnabled; // true, если нужно ввести код
    private String token; // будет null, если twoFactorEnabled = true

    // Конструкторы, геттеры, сеттеры
    public static AuthenticationResponse twoFactorRequired() {
        return new AuthenticationResponse(true, null);
    }

    public static AuthenticationResponse success(String token) {
        return new AuthenticationResponse(false, token);
    }
}
