package com.watchtogether.chatservice.repository;

import com.watchtogether.chatservice.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MessageRepository extends JpaRepository<ChatMessage, UUID> {
}
