package com.watchtogether.chatservice.entity;

import com.watchtogether.chatservice.enums.ModerationType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Entity
public class ModerationAction {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Enumerated(EnumType.STRING)
    private ModerationType type;

    @Column(nullable = false)
    private UUID moderatorId;

    @Column
    private UUID targetUserId; // Для банов/мутов

    @Column
    private UUID messageId; // Для удаления сообщений

    @Column
    private UUID roomId;

    @Column
    private Duration duration; // Для временных действий

    @CreationTimestamp
    private Instant timestamp;
}


