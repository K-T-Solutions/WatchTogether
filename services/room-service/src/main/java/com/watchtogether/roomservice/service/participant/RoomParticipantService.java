package com.watchtogether.roomservice.service.participant;

import com.watchtogether.roomservice.entity.RoomParticipantEntity;
import com.watchtogether.roomservice.exception.NotRoomMemberException;
import com.watchtogether.roomservice.exception.ResourceNotFoundException;
import com.watchtogether.roomservice.repository.RoomParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class RoomParticipantService implements IRoomParticipantService {
    private final RoomParticipantRepository repository;

    @Override
    public RoomParticipantEntity getByRoomIdAndUserId(UUID roomId, UUID userId) {
        return repository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() ->
                        new NotRoomMemberException("User with id " + userId +
                                " is not member of room " + roomId));
    }

    @Override
    public List<RoomParticipantEntity> getParticipantsByRoomId(UUID roomId) {
        return repository.findAllByRoomId(roomId);
    }


}
