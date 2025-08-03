package com.watchtogether.chatservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@DiscriminatorValue("ROOM")
public class RoomMessage extends ChatMessage {
    @Column(nullable = false)
    private UUID roomId;

    @Column
    private UUID replyTo; // Для ответов на сообщения

    @ElementCollection
    private Set<UUID> seenBy = new HashSet<>(); // Кто просмотрел
}
