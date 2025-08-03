package com.watchtogether.chatservice.service;

import com.watchtogether.chatservice.entity.ChatChannel;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public interface IChannelService {
    ChatChannel getOrCreatePrivateChatChannel(UUID user1Id, UUID user2Id);
}
