package com.watchtogether.roomservice.util;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class InvitationTokenGenerator {

    @Value("${invitation.tokenLength}")
    private  int TOKEN_LENGTH;

    @Value("${invitation.secretKey}")
    private String secretKey;

    public String generateSecureToken() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TOKEN_LENGTH);

        for (int i = 0; i < TOKEN_LENGTH; i++) {
            int randomIndex = random.nextInt(secretKey.length());
            sb.append(secretKey.charAt(randomIndex));
        }

        return sb.toString();
    }
}