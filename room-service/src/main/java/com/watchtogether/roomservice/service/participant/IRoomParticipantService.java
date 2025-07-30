package com.watchtogether.roomservice.service.participant;

import com.watchtogether.roomservice.entity.RoomParticipantEntity;

import java.util.List;
import java.util.UUID;

public interface IRoomParticipantService {
    RoomParticipantEntity getByRoomIdAndUserId(UUID roomId, UUID userId);

    List<RoomParticipantEntity> getParticipantsByRoomId(UUID roomId);
}
