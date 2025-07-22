package com.watchtogether.roomservice.service.room;

import com.watchtogether.roomservice.entity.RoomEntity;
import com.watchtogether.roomservice.request.UpdateRoomRequest;

import java.util.UUID;

public interface IRoomService {
    RoomEntity getRoomById(UUID roomId);

    RoomEntity updateRoom(UpdateRoomRequest request, UUID roomId, UUID userId);
}
