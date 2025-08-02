package com.watchtogether.chatservice.service;

import com.watchtogether.chatservice.entity.ChatChannel;
import com.watchtogether.chatservice.enums.ChannelType;
import com.watchtogether.chatservice.repository.ChatChannelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class ChannelService implements IChannelService {
    private final ChatChannelRepository repository;

    @Override
    public ChatChannel getOrCreatePrivateChatChannel(UUID user1Id, UUID user2Id) {
        return repository.findByUser1IdAndUser2Id(user1Id, user2Id)
                .orElseGet(() -> {
                    ChatChannel channel = new ChatChannel();
                    channel.setType(ChannelType.PRIVATE);
                    channel.setUser1Id(user1Id);
                    channel.setUser2Id(user2Id);
                    return repository.save(channel);
                });
    }


}
