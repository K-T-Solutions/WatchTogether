package com.watchtogether.roomservice.service.room;

import com.watchtogether.roomservice.entity.RoomEntity;
import com.watchtogether.roomservice.enums.RoomCategory;
import com.watchtogether.roomservice.exception.RoomNotFoundException;
import com.watchtogether.roomservice.kafka.KafkaProducer;
import com.watchtogether.roomservice.repository.RoomRepository;
import com.watchtogether.roomservice.request.CreateRoomRequest;
import com.watchtogether.roomservice.request.UpdateRoomRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class RoomService implements IRoomService {
    private final RoomRepository roomRepository;
    private final KafkaProducer kafkaProducer;

    @Override
    public RoomEntity getRoomById(UUID roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() ->
                        new RoomNotFoundException("Room with id " + roomId + " not found"));
    }

    @Override
    public List<RoomEntity> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    public List<RoomEntity> getAllRoomsByCategory(String categoryDisplayName) {//TODO: кидает ошибкка об категории
        return roomRepository.findAllByCategory(RoomCategory.valueOf(categoryDisplayName));
    }

    @Override
    public RoomEntity updateRoom(UpdateRoomRequest request, UUID roomId, UUID userId) {
        return Optional.ofNullable(getRoomById(roomId))
                .map(room -> {
                    room.setName(request.getRoomName());
                    room.setDescription(request.getDescription());
                    room.setType(request.getRoomType());
                    room.setCategory(request.getRoomCategory());
                    return roomRepository.save(room);
                }).orElseThrow(() ->
                        new RoomNotFoundException("Room with id " + roomId + " not found"));
    }

    @Override
    public RoomEntity createRoom(CreateRoomRequest request, UUID ownerId) { //TODO: - тут id не должно быть. оно должно извлекаться из jwt
        //TODO: добавить наверное если почта не подтверждена - то нельзя создавать комнату

        RoomEntity room = new RoomEntity(); //TODO: также надо чтобы один пользователь не мог нахоодитьч сразу в двух комнатах
        room.setName(request.getName());
        room.setDescription(request.getDescription());
        room.setType(request.getType());
        room.setCategory(request.getCategory());
        room.setPasswordHash(request.getPassword()); //TODO: хешировать (мб и не надо)
        room.setMaxParticipants(request.getMaxParticipant());
        room.setOwnerId(ownerId);

        //kafkaProducer.sendRoomCreatedEvent(); //TODO: here need to impl

        return roomRepository.save(room);
    }



}
