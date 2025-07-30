package com.watchtogether.chatservice.repository;

import com.watchtogether.chatservice.entity.ChatChannel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ChatChannelRepository extends JpaRepository<ChatChannel, UUID> {


    Optional<ChatChannel> findByUser1IdAndUser2Id(UUID user1Id, UUID user2Id);
}
