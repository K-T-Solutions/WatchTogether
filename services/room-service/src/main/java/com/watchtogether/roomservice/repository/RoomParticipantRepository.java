package com.watchtogether.roomservice.repository;

import com.watchtogether.roomservice.entity.RoomParticipantEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomParticipantRepository extends JpaRepository<RoomParticipantEntity, UUID> {


    List<RoomParticipantEntity> findAllByRoomId(UUID roomId);

    Optional<RoomParticipantEntity> findByRoomIdAndUserId(UUID roomId, UUID userId);
}
