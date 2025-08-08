package com.watchtogether.authservice.service.VerificationToken;

public interface IOtpService {
    void initiateLoginVerification(String email);

//    void storeOtp(String key, String otp);

    boolean validateOtp(String key, String otp);
}
