package com.watchtogether.chatservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@DiscriminatorValue("PRIVATE")
public class PrivateMessage extends ChatMessage {
    @Column(nullable = false)
    private UUID recipientId;

    @Column
    private boolean isRead = false;
}
