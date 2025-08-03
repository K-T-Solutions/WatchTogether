package com.watchtogether.authservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchtogether.authservice.event.UpdateUserCredEvent;
import com.watchtogether.authservice.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@RequiredArgsConstructor
@Service
public class KafkaProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendRegisterEvent(UserRegisteredEvent event) {
        try {
            byte[] eventBytes = objectMapper.writeValueAsBytes(event);

            log.info("Sending user registered event for user with id: {}", event.getUserId());

            kafkaTemplate.send("user-registered", event.getUserId().toString(), eventBytes)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("Register event sent successfully for user with id: {}", event.getUserId());
                        } else {
                            log.error("Failed to send register event for user with id: {}", event.getUserId(), ex);
                        }
                    });

        } catch (Exception e) {
            log.error("Error serializing register event for user with id: {}", event.getUserId(), e);
        }
    }

    public void sendUpdateUserCredEvent(UpdateUserCredEvent event) {

        try {
            byte[] eventBytes = objectMapper.writeValueAsBytes(event);

            log.info("Sending update user cred event for user with id: {}", event.getUserId());

            kafkaTemplate.send("update-user-cred", event.getUserId().toString(), eventBytes)
                    .whenComplete((result, ex) -> {
                        if (ex == null) {
                            log.info("Update cred event sent successfully for user with id: {}", event.getUserId());
                        } else {
                            log.error("Failed to send update cred event for user with id: {}", event.getUserId(), ex);
                        }
                    });

        } catch (Exception e) {
            log.error("Error serializing update cred event for user with id: {}", event.getUserId(), e);
        }

    }

}
