package com.watchtogether.authservice.service.Otp;

public interface IOtpService {
    void initiateEmailVerification(String email);

//    void storeOtp(String key, String otp);

//    void initiateEmailVerification(String email);

    void initiate2FAVerification(String email);

    boolean validateOtp(String key, String otp);
}
