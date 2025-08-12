package com.watchtogether.roomservice.service.room;

import com.watchtogether.grpc.CreateRoomRequest;
import com.watchtogether.grpc.RoomCategory;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;

import java.util.List;

public interface IRoomService {
    ActiveRoomEntity findRoomById(String roomId);

    ActiveRoomEntity findRoomByOwnerId(String ownerId);

    List<ActiveRoomEntity> findAllPublicRooms();

    ActiveRoomEntity createRoom(CreateRoomRequest grpcRequest);

    List<ActiveRoomEntity> findAllRoomsByCategory(RoomCategory roomCategory);

    boolean addParticipantToRoom(String roomId, String participantId);

    boolean addParticipantToRoom(String roomId, String participantId, String password);

    boolean removeParticipantFromRoom(String roomId, String participantId);
}
