package com.watchtogether.roomservice.service.room;

import com.watchtogether.grpc.*;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;

import java.util.List;

public interface IRoomService {
    ActiveRoomEntity findRoomById(String roomId);

    ActiveRoomEntity findRoomByOwnerId(String ownerId);

    List<ActiveRoomEntity> findAllPublicRooms();

    ActiveRoomEntity createRoom(CreateRoomRequest grpcRequest);

    List<ActiveRoomEntity> findAllRoomsByCategory(RoomCategory roomCategory);

    JoinToRoomResponse.Builder joinToRoom(AddParticipantRequest grpcRequest);

    boolean removeParticipantFromRoom(String roomId, String participantId);

    ActiveRoomEntity addParticipantToRoom(AddParticipantRequest grpcRequest);
}
