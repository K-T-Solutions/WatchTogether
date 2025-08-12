package com.watchtogether.roomservice.repository;

import com.watchtogether.grpc.RoomCategory;
import com.watchtogether.grpc.RoomType;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;

public interface ActiveRoomRepository extends CrudRepository<ActiveRoomEntity, String> {

    Optional<ActiveRoomEntity> findByOwnerId(String ownerId);

    List<ActiveRoomEntity> findAllByType(RoomType type);

    List<ActiveRoomEntity> findAllByCategory(RoomCategory category);

}
