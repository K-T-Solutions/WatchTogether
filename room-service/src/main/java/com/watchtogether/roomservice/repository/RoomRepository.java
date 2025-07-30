package com.watchtogether.roomservice.repository;

import com.watchtogether.roomservice.entity.RoomEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomRepository extends JpaRepository<RoomEntity, UUID> {

}
