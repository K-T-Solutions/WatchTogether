package com.watchtogether.chatservice.event;

import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
public class MessageEvent {
    private EventType eventType;
    private UUID messageId;
    private UUID senderId;
    private UUID receiverId;
    private UUID roomId;
    private String content;
    private Instant timestamp = Instant.now();

    public enum EventType {
        PRIVATE_MESSAGE,
        ROOM_MESSAGE,
        MESSAGE_DELETED
    }
}

