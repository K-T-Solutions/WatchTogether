package com.watchtogether.authservice.service.TwoFactorAuth;

import com.watchtogether.authservice.exception.AccessDeniedException;

import java.util.UUID;

public interface ITwoFactorAuthService {

    /**
     * Enables Two-Factor Authentication for a specific user.
     * It verifies if the user's email is confirmed, then generates and stores
     * hashed recovery codes.
     *
     * @param userId The unique identifier of the user for whom to enable 2FA.
     * @throws AccessDeniedException if the user's email is not verified.
     */
    void enable2FA(UUID userId);

}
