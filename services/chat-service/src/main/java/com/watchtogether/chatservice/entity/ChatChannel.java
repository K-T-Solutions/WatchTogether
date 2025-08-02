package com.watchtogether.chatservice.entity;

import com.watchtogether.chatservice.enums.ChannelType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
public class ChatChannel {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Enumerated(EnumType.STRING)
    private ChannelType type;

    private UUID roomId; // Для комнатных чатов
    private UUID user1Id; // Для личных чатов
    private UUID user2Id; // Для личных чатов

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL)
    private List<ChatMessage> messages = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;
}


