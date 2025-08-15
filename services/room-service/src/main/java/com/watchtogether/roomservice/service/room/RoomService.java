package com.watchtogether.roomservice.service.room;

import com.google.protobuf.Timestamp;
import com.watchtogether.grpc.*;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import com.watchtogether.roomservice.exception.PermissionDeniedException;
import com.watchtogether.roomservice.exception.RoomNotFoundException;
import com.watchtogether.roomservice.kafka.KafkaProducer;
import com.watchtogether.roomservice.repository.ActiveRoomRepository;
import com.watchtogether.roomservice.util.RoomMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class RoomService implements IRoomService {
    private final ActiveRoomRepository roomRepository;
    private final KafkaProducer kafkaProducer;
    private final RoomMapper roomMapper;

    @Override
    public ActiveRoomEntity createRoom(CreateRoomRequest grpcRequest) { //TODO: надо как то получать id создателя из jwt, а не просто передавать
        ActiveRoomEntity activeRoom = new ActiveRoomEntity(
                new ActiveRoomEntity.RoomParticipantEntity(
                        grpcRequest.getRoomCreator().getUserId(),
                        grpcRequest.getRoomCreator().getDisplayName()),
                grpcRequest.getRoomName(),
                grpcRequest.getRoomDescription(),
                grpcRequest.getRoomType(),
                grpcRequest.getCategory(),
                grpcRequest.getRoomPassword(),
                grpcRequest.getMaxParticipants());
        return roomRepository.save(activeRoom);
    }

    @Override
    public ActiveRoomEntity findRoomById(String roomId) {
        return roomRepository.findById(roomId).orElseThrow(() ->
                new RoomNotFoundException("Room with id " + roomId + " not found"));
    }

    @Override
    public ActiveRoomEntity findRoomByOwnerId(String ownerId) {
        return roomRepository.findByOwnerId(ownerId).orElseThrow(() ->
                new RoomNotFoundException("Room with ownerId " + ownerId + " not found"));
    }

    @Override
    public List<ActiveRoomEntity> findAllPublicRooms() {
        return roomRepository.findAllByType(RoomType.PUBLIC);
    }

    @Override
    public List<ActiveRoomEntity> findAllRoomsByCategory(RoomCategory roomCategory) {
        return roomRepository.findAllByCategory(roomCategory);
    }

    @Override
    public JoinToRoomResponse.Builder joinToRoom(AddParticipantRequest grpcRequest) { //TODO: проверки вынести в отдельную функцию
        var room = addParticipantToRoom(grpcRequest);
        return roomMapper.mapJoinToRoomResponseToGrpc(room);
    }

    @Override
    public boolean removeParticipantFromRoom(String roomId, String userId) {
        var room = findRoomById(roomId); //TODO: в общем даже если пользователя нет в списке - возвращает true (проблема ли это ?)

        room.removeParticipant(userId);

        if (room.isEmpty()) {
            roomRepository.deleteById(roomId);
            log.info("Room {} deleted - no participants left", roomId);
        } else {
            roomRepository.save(room);
            log.info("User {} left room {}", userId, roomId);
        }
        return true;
    }

    @Override
    public ActiveRoomEntity addParticipantToRoom(AddParticipantRequest grpcRequest) {
        ActiveRoomEntity room = findRoomById(grpcRequest.getRoomId());

        if (room.isBanned(grpcRequest.getParticipant().getUserId())) {
            log.warn("User {} is banned from room {}",
                    grpcRequest.getParticipant().getUserId(),
                    grpcRequest.getRoomId());
            throw new PermissionDeniedException("User "+ grpcRequest.getParticipant().getUserId()+" is banned");
        }

        if (room.getParticipants().size() >= room.getMaxParticipants()) {
            log.warn("Room {} is full", grpcRequest.getRoomId());
            throw new PermissionDeniedException("Room "+ grpcRequest.getRoomId()+" is full");
        }

        if (room.getPasswordHash().isEmpty()) { // if password is set
            if (!grpcRequest.getPassword().isEmpty() &&
                    !room.getPasswordHash().equals(grpcRequest.getPassword())) { //TODO: add encode
                log.warn("Incorrect password for user {}", grpcRequest.getParticipant().getUserId());
                throw new PermissionDeniedException("Incorrect password for user " + grpcRequest.getParticipant().getUserId());
            }
        }

        room.addParticipant(new ActiveRoomEntity.RoomParticipantEntity(
                grpcRequest.getParticipant().getUserId(),
                grpcRequest.getParticipant().getDisplayName()));
        roomRepository.save(room);

        log.info("User {} joined room {}", grpcRequest.getParticipant().getUserId(), grpcRequest.getRoomId());
        return room;
    }




}
