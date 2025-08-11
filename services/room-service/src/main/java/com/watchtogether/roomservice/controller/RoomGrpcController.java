package com.watchtogether.roomservice.controller;

import com.google.protobuf.Empty;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import com.watchtogether.roomservice.service.room.IRoomService;
import com.watchtogether.grpc.*;
import io.grpc.ServerInterceptor;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
//import org.springframework.security.core.context.SecurityContextHolder; // Пример получения пользователя

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@GrpcService
public class RoomGrpcController extends com.watchtogether.grpc.RoomServiceGrpc.RoomServiceImplBase {

    private final IRoomService roomService;

    @Override
    public void getRoomById(GetRoomByIdRequest request, StreamObserver<RoomResponse> responseObserver) {
        var roomEntity = roomService.findRoomById(request.getRoomId());
        responseObserver.onNext(RoomResponse.newBuilder()
                        .setRoomId(roomEntity.getId())
                        .setOwnerId(roomEntity.getOwnerId())
                        .setRoomName(roomEntity.getName())
                        .setRoomDescription(roomEntity.getDescription())
                        .setRoomType(roomEntity.getType())
                        .setRoomCategory(roomEntity.getCategory())
                        .setMaxParticipants(roomEntity.getMaxParticipants())
                        .setNeedPassword(!roomEntity.getPasswordHash().isEmpty())
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void getRoomByOwnerId(GetRoomByOwnerIdRequest request, StreamObserver<RoomResponse> responseObserver) {
        super.getRoomByOwnerId(request, responseObserver);
    }

    @Override
    public void getAllPublicRooms(Empty request, StreamObserver<RoomListResponse> responseObserver) {

        List<ActiveRoomEntity> publicRooms = roomService.findAllPublicRooms();

        log.info("Rooms name: {}", publicRooms.getFirst().getName());

        responseObserver.onNext(RoomListResponse.newBuilder()
                        .addAllRooms(publicRooms
                                .stream()
                                .map(this::mapToGrpcRoomResponse)
                                .toList())
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void createRoom(CreateRoomRequest request, StreamObserver<CreateRoomResponse> responseObserver) {


        var createdRoom = roomService.createRoom(request); //TODO: add exception handle
        responseObserver.onNext(CreateRoomResponse.newBuilder()
                        .setSuccess(true)
                        .setMessage("Room created successfully")
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void addParticipantToRoom(AddParticipantRequest request, StreamObserver<AddParticipantResponse> responseObserver) { //TODO: ну тут как то надо все же проверять

        boolean success;

        if (request.getPassword().isEmpty()) {
            success = roomService.addParticipantToRoom(request.getRoomId(), request.getParticipantId());
            log.info("two par");
            log.info("pass: {}", request.getPassword());
        } else {
            log.info("three par");
            success = roomService.addParticipantToRoom(request.getRoomId(), request.getParticipantId(), request.getPassword());
        }

        responseObserver.onNext(AddParticipantResponse.newBuilder()
                        .setSuccess(success)
                        .setMessage(success ? "Participant added successfully" : "Participant not added")
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void removeParticipantFromRoom(RemoveParticipantRequest request, StreamObserver<RemoveParticipantResponse> responseObserver) {
        boolean success = roomService.removeParticipantFromRoom(request.getRoomId(), request.getParticipantId()); //TODO: ловить искл.
        responseObserver.onNext(RemoveParticipantResponse.newBuilder()
                .setSuccess(success)
                .setMessage(success ? "Participant removed successfully" : "Participant not removed")
                .build());
        responseObserver.onCompleted();
    }

    private RoomResponse mapToGrpcRoomResponse(ActiveRoomEntity entity) {
        return RoomResponse.newBuilder()
                .setRoomId(entity.getId())
                .setOwnerId(entity.getOwnerId())
                .setRoomName(entity.getName())
                .setRoomDescription(entity.getDescription() != null ? entity.getDescription() : "")
                .setRoomType(entity.getType())
                .setRoomCategory(entity.getCategory())
                .setMaxParticipants(entity.getMaxParticipants())
                .setNeedPassword(!entity.getPasswordHash().isEmpty())
//                .addAllParticipantIds(entity.getParticipantIds()) // если есть список участников
//                .setCreatedAt(Timestamp.newBuilder()
//                        .setSeconds(entity.getCreatedAt().getEpochSecond())
//                        .setNanos(entity.getCreatedAt().getNano())
//                        .build())
//                .setStatus(mapStatusToGrpc(entity.getStatus()))
                .build();
    }



}