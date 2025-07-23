package com.watchtogether.chatservice.entity;

import com.watchtogether.chatservice.enums.MessageStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "message_type", discriminatorType = DiscriminatorType.STRING)
public abstract class ChatMessage {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Column(nullable = false)
    private UUID senderId;

    @Column(nullable = false, length = 2000)
    private String content;

    @CreationTimestamp
    private Instant timestamp;

    @Column
    private boolean deleted = false;

    @Column
    private UUID deletedBy; // Для модерации

    @Enumerated(EnumType.STRING)
    private MessageStatus status = MessageStatus.SENT;


//    private ChatChannel channel;
}


