package com.watchtogether.roomservice.service.room;

import com.watchtogether.roomservice.entity.RoomEntity;
import com.watchtogether.roomservice.request.UpdateRoomRequest;

import java.util.List;
import java.util.UUID;

public interface IRoomService {
    RoomEntity getRoomById(UUID roomId);

    List<RoomEntity> getAllRooms();

    List<RoomEntity> getAllRoomsByCategory(String categoryDisplayName);

    RoomEntity updateRoom(UpdateRoomRequest request, UUID roomId, UUID userId);
}
