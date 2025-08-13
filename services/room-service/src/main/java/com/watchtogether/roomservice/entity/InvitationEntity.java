package com.watchtogether.roomservice.entity;

import com.watchtogether.roomservice.exception.InvalidInvitationException;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

import java.time.Duration;
import java.time.Instant;

@Getter
@Setter
@RedisHash(value = "rooms_invitation")
public class InvitationEntity { //TODO: improve
    @Id
    private String code; // invite code

    private String roomId;

    private String creatorId;

    private Instant expiresAt;

    private int maxUses = 1;

    private int useCount = 0;

    private Instant createdAt;

    @TimeToLive
    private Long ttl = 1200L;

    public InvitationEntity() {
        createdAt = Instant.now();
    }

    public InvitationEntity(String code,
                            String roomId,
                            String creatorId,
                            Duration duration,
                            int maxUses) {
        this();
        this.roomId = roomId;
        this.creatorId = creatorId;
        expiresAt = Instant.now().plusSeconds(duration.toSeconds());
        this.maxUses = maxUses;
        this.ttl = duration.toSeconds(); //TODO: add func to generate token
    }

    public void use() {
        this.useCount++;
    }

    public boolean canBeUsed() { //TODO: если максимум достигнется пусть удаляется
        return !isExpired() && !isMaxUsesReached();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isMaxUsesReached() {
        return useCount >= maxUses;
    }

    public int getRemainingUses() {
        return Math.max(0, maxUses - useCount);
    }

    public Duration getTimeUntilExpiry() {
        return Duration.between(Instant.now(), expiresAt);
    }
}
