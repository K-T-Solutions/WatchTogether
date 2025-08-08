package com.watchtogether.authservice.service.Otp;

public interface IOtpService {
    void initiateVerification(String email);

//    void storeOtp(String key, String otp);

//    void initiateEmailVerification(String email);

    boolean validateOtp(String key, String otp);
}
