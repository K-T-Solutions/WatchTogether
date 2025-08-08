package com.watchtogether.authservice.service.VerificationToken;

import com.watchtogether.authservice.service.TwoFactorAuth.MailSender;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@RequiredArgsConstructor
@Service
public class OtpService implements IOtpService {

    private static final long OTP_VALIDITY_MINUTES = 5;
    private static final String OTP_CODE_SUBJECT = "[WatchTogether] Your Verification Code]";

    private final PasswordEncoder passwordEncoder;
    private final RedisTemplate<String, String> redisTemplate;
    private final MailSender mailSender;

    private static final SecureRandom random = new SecureRandom();

    @Override
    public void initiateLoginVerification(String email) {
        String code = generateOtpCode();
        storeOtp(email, code);
        mailSender.send(email, OTP_CODE_SUBJECT, code);
    }

    @Override
    public boolean validateOtp(String key, String otp) {
        String redisKey = "otp:" + key;
        String storedOtp = redisTemplate.opsForValue().get(redisKey);

        if (passwordEncoder.matches(otp, storedOtp)) {
            redisTemplate.delete(redisKey);
            return true;
        }
        return false;
    }

    public void storeOtp(String key, String otp) {
        String redisKey = "otp:" + key;
        redisTemplate.opsForValue()
                .set(redisKey, passwordEncoder.encode(otp), Duration.ofMinutes(OTP_VALIDITY_MINUTES));
    }

    private String generateOtpCode() {
        // Generates a number between 100000 and 999999
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

}
