package com.watchtogether.authservice.service.TwoFactorAuth;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@RequiredArgsConstructor
@Service
public class TwoFactorAuthService implements ITwoFactorAuthService {
//    private final MailSender mailSender;
//
//    private final String VERIFICATION_CODE_SUBJECT = ""; //TODO change

//    public void sendVerificationCode(UUID userId, String emailTo) {
//        String code = generateCode();
//        addVerificationCode(userId, emailTo, code);
//        mailSender.send(emailTo, VERIFICATION_CODE_SUBJECT, code);
//    }
//
//    @Override
//    public Veri addVerificationCode(UUID userId, String email, String code) {
//        return Optional.ofNullable(getVerificationCodeByEmail(email))
//                .map(verificationCode -> {
//                    verificationCode.setCode(code);
//                    verificationCode.prePersist();
//                    return verificationCodeRepository.save(verificationCode);
//                })
//                .orElseGet(() -> {
//                    VerificationCodeEntity verificationCode = new VerificationCodeEntity();
//                    verificationCode.setUserId(userId);
//                    verificationCode.setEmail(email);
//                    verificationCode.setCode(code);
//                    verificationCode.prePersist();
//                    return verificationCodeRepository.save(verificationCode);
//                });
//    }

    private String generateCode() {
        return String.format("%06d",
                ThreadLocalRandom.current().nextInt(100000, 999999));
    }

}
