package com.watchtogether.chatservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.watchtogether.chatservice.event.MessageEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class KafkaProducer {
    private final KafkaTemplate<String, byte[]> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendNewMessageNotification(MessageEvent event) { //TODO: here change logs
        try {
            UUID correlationId = UUID.randomUUID();
            byte[] eventBytes = objectMapper.writeValueAsBytes(event);
            log.info("Sending successful new message event with id: {}", correlationId);

            kafkaTemplate.send("new-message", correlationId.toString(), eventBytes);
        } catch (Exception e) {
            log.error("Error serializing new message event with id: {}", event.getMessageId(), e);
        }
    }
}
