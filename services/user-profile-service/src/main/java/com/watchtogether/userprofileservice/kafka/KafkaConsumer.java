package com.watchtogether.userprofileservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchtogether.userprofileservice.event.UpdateUserCredEvent;
import com.watchtogether.userprofileservice.event.UserRegisterEvent;
import com.watchtogether.userprofileservice.service.IUserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class KafkaConsumer {
    private final ObjectMapper objectMapper;
    private final IUserProfileService userService;

    @KafkaListener(topics = "user-registered", groupId = "user-profile-group")
    public void handleUserRegisterEvent(ConsumerRecord<String, byte[]> record ) {
        try {
            String id = record.key();
            byte[] body = record.value();

            UserRegisterEvent event = objectMapper.readValue(body, UserRegisterEvent.class);
            log.info("Received register user with id {} successful", event.getUserId());
            userService.registerUser(event);

        } catch (Exception e) {
            log.error("Error deserializing user register event for userId: {}", record.key(), e);
        }
    }

    @KafkaListener(topics = "update-user-cred", groupId = "user-profile-group")
    public void handleUserUpdateLoginEvent(ConsumerRecord<String, byte[]> record ) {
        try {
            String id = record.key();
            byte[] body = record.value();

            UpdateUserCredEvent event = objectMapper.readValue(body, UpdateUserCredEvent.class);

            if(event.getCredType().equals("LOGIN")) {
                log.info("Received update user login with id {} successful", event.getUserId());
                userService.updateUserLoginById(event);
            } else if(event.getCredType().equals("EMAIL")) {
                log.info("Received update user email with id {} successful", event.getUserId());
                userService.updateUserEmailById(event);
            }

        } catch (Exception e) {
            log.error("Error deserializing update user profile event for userId: {}", record.key(), e);
        }
    }


}
