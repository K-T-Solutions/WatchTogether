package com.watchtogether.roomservice.controller;

import com.watchtogether.roomservice.entity.RoomEntity;
import com.watchtogether.roomservice.service.room.IRoomService;
import com.watchtogether.roomservice.util.RoomGrpcMapper;
import com.watchtogether.grpc.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
//import org.springframework.security.core.context.SecurityContextHolder; // Пример получения пользователя

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@GrpcService
public class RoomGrpcController extends com.watchtogether.grpc.RoomServiceGrpc.RoomServiceImplBase {

    private final IRoomService roomService;

    @Override
    public void getRoomById(
            RoomIdRequestGrpc request,
            StreamObserver<RoomResponseGrpc> responseObserver
    ) {
        log.info("gRPC getRoomById, id: {}", request.getRoomId());
        var room = roomService.getRoomById(UUID.fromString(request.getRoomId()));
        responseObserver.onNext(RoomGrpcMapper.toRoomResponseGrpc(room));
        responseObserver.onCompleted();
    }

    @Override
    public void getAllRooms(
            com.watchtogether.grpc.EmptyGrpc request,
            StreamObserver<RoomListResponseGrpc> responseObserver
    ) {
        log.info("gRPC getAllRooms");
        var rooms = roomService.getAllRooms();
        var roomProtos = rooms.stream()
                .map(RoomGrpcMapper::toRoomGrpc)
                .collect(Collectors.toList());
        responseObserver.onNext(RoomListResponseGrpc.newBuilder().addAllRooms(roomProtos).build());
        responseObserver.onCompleted();
    }

    @Override
    public void getRoomsByCategory(
            CategoryRequestGrpc request,
            StreamObserver<RoomListResponseGrpc> responseObserver
    ) {
        log.info("gRPC getRoomsByCategory: {}", request.getCategory());
        List<RoomEntity> rooms = roomService.getAllRoomsByCategory(request.getCategory());
        var roomProtos = rooms.stream()
                .map(RoomGrpcMapper::toRoomGrpc)
                .collect(Collectors.toList());
        responseObserver.onNext(RoomListResponseGrpc.newBuilder().addAllRooms(roomProtos).build());
        responseObserver.onCompleted();
    }

    @Override
    public void createRoom(
            CreateRoomRequestGrpc request,
            StreamObserver<RoomResponseGrpc> responseObserver
    ) {
        log.info("gRPC createRoom: {}", request.getName());
        // ID пользователя берется из безопасного контекста, а не из запроса!
        String userId = UUID.randomUUID().toString(); //TODO:CHANGE Заглушка, здесь должна быть логика

        var roomEntity = roomService
                .createRoom(RoomGrpcMapper
                        .fromCreateRequestGrpc(request), UUID.fromString(userId));

        responseObserver.onNext(RoomGrpcMapper.toRoomResponseGrpc(roomEntity));
        responseObserver.onCompleted();
    }

    @Override
    public void updateRoom(UpdateRoomRequestGrpc request, StreamObserver<RoomResponseGrpc> responseObserver) {
        log.info("gRPC updateRoom: {}", request.getRoomId());
        String userId = "извлечь_из_grpc_metadata";

        // Здесь ваш сервис должен принимать DTO для обновления
        var updatedEntity = roomService.updateRoom(
                RoomGrpcMapper.fromUpdateRequest(request),
                UUID.fromString(request.getRoomId()),
                UUID.fromString(userId));//TODO: refactor

        responseObserver.onNext(RoomGrpcMapper.toRoomResponseGrpc(updatedEntity));
        responseObserver.onCompleted();
    }
}