package com.watchtogether.authservice.service.TwoFactorAuth;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

//@RequiredArgsConstructor
//@Service
public class MailSender { //TODO: change here
//    private final JavaMailSender mailSender;
//
//    @Value("${spring.mail.username}")
//    private String setFrom;
//
//    public void send(String emailTo, String subject, String message) {
//        SimpleMailMessage mailMessage = new SimpleMailMessage();
//
//        mailMessage.setFrom(setFrom);
//        mailMessage.setTo(emailTo);
//        mailMessage.setSubject(subject);
//        mailMessage.setText(message);
//
//        mailSender.send(mailMessage);
//    }
}
