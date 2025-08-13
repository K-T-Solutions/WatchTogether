package com.watchtogether.roomservice.service.room;

import com.google.protobuf.Timestamp;
import com.watchtogether.grpc.*;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import com.watchtogether.roomservice.exception.RoomNotFoundException;
import com.watchtogether.roomservice.kafka.KafkaProducer;
import com.watchtogether.roomservice.repository.ActiveRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class RoomService implements IRoomService {
    private final ActiveRoomRepository roomRepository;
    private final KafkaProducer kafkaProducer;

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
    public JoinToRoomResponse.Builder addParticipantToRoom(String roomId, RoomParticipant participantRequest) {
        ActiveRoomEntity room = findRoomById(roomId);

        JoinToRoomResponse.Builder response = JoinToRoomResponse.newBuilder();

        if (room.isBanned(participantRequest.getUserId())) {
            log.warn("User {} is banned from room {}", participantRequest.getUserId(), roomId);
            return response.setSuccess(false);
        }

        if (room.getParticipants().size() >= room.getMaxParticipants()) {
            log.warn("Room {} is full", roomId);
            return response.setSuccess(false);
        }

        room.addParticipant(new ActiveRoomEntity.RoomParticipantEntity(
                participantRequest.getUserId(),
                participantRequest.getDisplayName()));
        roomRepository.save(room);

        log.info("User {} joined room {}", participantRequest.getUserId(), roomId);


        return response
                .setSuccess(true)
                .setRoomId(room.getId())
                .setRoomName(room.getName())
                .setRoomDescription(room.getDescription())
                .setRoomType(room.getType())
                .setRoomCategory(room.getCategory())
                .setMaxParticipants(room.getMaxParticipants())
                .setParticipantNumber(room.getParticipants().size())
                .setCreatedAt(Timestamp.newBuilder()
                    .setSeconds(room.getCreatedAt().getEpochSecond())
                    .setNanos(room.getCreatedAt().getNano())
                    .build())
                .addAllRoomParticipants(room.getParticipants().stream()
                        .map(participant -> RoomParticipant.newBuilder()
                                .setUserId(participant.getUserId())
                                .setDisplayName(participant.getDisplayName())
                                .build()).toList());

    }

    @Override
    public JoinToRoomResponse.Builder addParticipantToRoom(AddParticipantRequest grpcRequest) {
        ActiveRoomEntity room = findRoomById(grpcRequest.getRoomId());

        JoinToRoomResponse.Builder response = JoinToRoomResponse.newBuilder();

        if (room.isBanned(grpcRequest.getParticipant().getUserId())) {
            log.warn("User {} is banned from room {}", grpcRequest.getParticipant().getUserId(), grpcRequest.getRoomId());
            return response.setSuccess(false);
        }

        if (room.getParticipants().size() >= room.getMaxParticipants()) {
            log.warn("Room {} is full", grpcRequest.getRoomId());
            return response.setSuccess(false);
        }

        if (!grpcRequest.getPassword().isEmpty() && !room.getPasswordHash().equals(grpcRequest.getPassword())) { //TODO: add encode
            log.warn("Incorrect password for user {}", grpcRequest.getParticipant().getUserId());
            return response.setSuccess(false);
        }

        room.addParticipant(new ActiveRoomEntity.RoomParticipantEntity(
                grpcRequest.getParticipant().getUserId(),
                grpcRequest.getParticipant().getDisplayName()));
        roomRepository.save(room);

        log.info("User {} joined room {}", grpcRequest.getParticipant().getUserId(), grpcRequest.getRoomId());

        return response
                .setSuccess(true)
                .setRoomId(room.getId())
                .setRoomName(room.getName())
                .setRoomDescription(room.getDescription())
                .setRoomType(room.getType())
                .setRoomCategory(room.getCategory())
                .setMaxParticipants(room.getMaxParticipants())
                .setParticipantNumber(room.getParticipants().size())
                .setCreatedAt(Timestamp.newBuilder()
                        .setSeconds(room.getCreatedAt().getEpochSecond())
                        .setNanos(room.getCreatedAt().getNano())
                        .build())
                .addAllRoomParticipants(room.getParticipants().stream()
                        .map(participant -> RoomParticipant.newBuilder()
                                .setUserId(participant.getUserId())
                                .setDisplayName(participant.getDisplayName())
                                .build()).toList());
    }

//    @Override
//    public boolean addParticipantToRoom(String roomId, String participantId, String password) {
//        ActiveRoomEntity room = findRoomById(roomId);
//
//        if (room.isBanned(participantId)) {
//            log.warn("User {} is banned from room {}", participantId, roomId);
//            return false;
//        }
//
//        if (room.getParticipantIds().size() >= room.getMaxParticipants()) {
//            log.warn("Room {} is full", roomId);
//            return false;
//        }
//
//        if (!password.isEmpty() && !room.getPasswordHash().equals(password)) { //TODO: add encode
//            log.warn("Incorrect password for user {}", participantId);
//            return false;
//        }
//
//        room.addParticipant(participantId);
//        roomRepository.save(room);
//
//        log.info("User {} joined room {}", participantId, roomId);
//        return true;
//    }

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




}
