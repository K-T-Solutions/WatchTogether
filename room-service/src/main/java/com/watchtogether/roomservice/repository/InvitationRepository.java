package com.watchtogether.roomservice.repository;

import com.watchtogether.roomservice.entity.InvitationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<InvitationEntity, UUID> {

    Optional<InvitationEntity> findByRoomIdAndToken(UUID roomId, String token);

    void deleteAllByExpiresAtBefore(Instant expiresAtBefore);

    Optional<InvitationEntity> findByRoomId(UUID roomId);
}
