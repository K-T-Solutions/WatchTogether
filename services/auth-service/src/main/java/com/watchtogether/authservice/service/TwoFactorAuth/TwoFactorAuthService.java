package com.watchtogether.authservice.service.TwoFactorAuth;

import com.watchtogether.authservice.exception.AccessDeniedException;
import com.watchtogether.authservice.service.credentials.ICredentialsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service to manage Two-Factor Authentication (2FA) logic,
 * including enabling 2FA, generating verification codes, and recovery codes.
 */
@RequiredArgsConstructor
@Service
public class TwoFactorAuthService implements ITwoFactorAuthService {

    // --- Dependencies ---
    private final ICredentialsService credentialsService;
    private final PasswordEncoder passwordEncoder;

    // --- Constants for Recovery Codes ---
    /** Characters used for generating recovery codes. Excludes ambiguous characters like 0, O, 1, I, l. */
    private static final String RECOVERY_CODE_CHARACTERS = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    /** The length of a single recovery code, without hyphens. */
    private static final int RECOVERY_CODE_LENGTH = 10;
    /** The number of recovery codes to generate for the user. */
    private static final int NUMBER_OF_RECOVERY_CODES = 10;
    /** A cryptographically strong random number generator. */
    private static final SecureRandom random = new SecureRandom();

    /*
     * Commented out mail sending logic for future implementation.
     *
     * private final MailSender mailSender;
     * private final String VERIFICATION_CODE_SUBJECT = "Your Verification Code";
     *
     * public void sendVerificationCode(UUID userId, String emailTo) {
     *     String code = generateOtpCode();
     *     // Logic to save the hashed OTP code to the database with an expiration time
     *     mailSender.send(emailTo, VERIFICATION_CODE_SUBJECT, code);
     * }
     */

    /**
     * {@inheritDoc}
     */
    @Override
    public void enable2FA(UUID userId) {
        var userEntity = credentialsService.getByUserId(userId);

        if (!userEntity.isEmailVerified()) {
            // TODO: Consider using a more specific exception, e.g., EmailNotVerifiedException.
            throw new AccessDeniedException("Email must be verified before enabling 2FA.");
        }

        List<String> rawRecoveryCodes = generateRecoveryCodes();
        List<String> hashedRecoveryCodes = rawRecoveryCodes.stream()
                .map(passwordEncoder::encode)
                .collect(Collectors.toList());

        userEntity.getTwoFactorAuth().setEnabled(true);
        userEntity.getTwoFactorAuth().setRecoveryCodes(hashedRecoveryCodes);

        // At this point, you should return the 'rawRecoveryCodes' to the user
        // so they can save them. Remember to show them only once.

//         credentialsService.save(userEntity); // Assuming you need to save the updated entity
    }

    /**
     * Generates a 6-digit One-Time Password (OTP) for email or SMS verification.
     *
     * @return A string representing the 6-digit code.
     */
    private String generateOtpCode() {
        // Generates a number between 100000 and 999999
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }


    /**
     * Generates and returns a list of unique, formatted recovery codes.
     * These are the raw, un-hashed codes intended to be shown to the user.
     *
     * @return A list of formatted recovery codes (e.g., ["ABCDE-12345", ...]).
     */
    public List<String> generateRecoveryCodes() {
        List<String> codes = new ArrayList<>();
        for (int i = 0; i < NUMBER_OF_RECOVERY_CODES; i++) {
            codes.add(generateSingleRecoveryCode());
        }
        return codes;
    }

    /**
     * Generates a single random recovery code from the allowed character set.
     *
     * @return A random string composed of characters from the RECOVERY_CODE_CHARACTERS constant.
     */
    private String generateSingleRecoveryCode() {
        StringBuilder code = new StringBuilder(RECOVERY_CODE_LENGTH);
        for (int i = 0; i < RECOVERY_CODE_LENGTH; i++) {
            code.append(RECOVERY_CODE_CHARACTERS.charAt(random.nextInt(RECOVERY_CODE_CHARACTERS.length())));
        }
        return formatRecoveryCode(code.toString());
    }

    /**
     * Formats a recovery code for better readability by adding a hyphen in the middle.
     * Example: "ABCDE12345" -> "ABCDE-12345"
     *
     * @param code The unformatted code.
     * @return The formatted code.
     */
    private String formatRecoveryCode(String code) {
        int middle = code.length() / 2;
        return code.substring(0, middle) + "-" + code.substring(middle);
    }
}