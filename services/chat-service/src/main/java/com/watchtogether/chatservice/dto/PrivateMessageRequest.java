package com.watchtogether.chatservice.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class PrivateMessageRequest {
    private UUID senderId;
    private UUID receiverId;
    private String content;
} 