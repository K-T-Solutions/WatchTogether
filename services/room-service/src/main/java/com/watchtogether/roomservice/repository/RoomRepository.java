package com.watchtogether.roomservice.repository;

import com.watchtogether.roomservice.entity.RoomEntity;
import com.watchtogether.roomservice.enums.RoomCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<RoomEntity, UUID> {

    List<RoomEntity> findAllByCategory(RoomCategory category);

}
