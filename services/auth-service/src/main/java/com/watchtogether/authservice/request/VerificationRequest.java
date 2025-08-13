package com.watchtogether.authservice.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class VerificationRequest {
    private String login; // или email, чтобы найти пользователя
    private String code;
    // геттеры, сеттеры
}
