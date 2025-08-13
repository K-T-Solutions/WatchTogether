package com.watchtogether.roomservice.controller;

import com.google.protobuf.Empty;
import com.google.protobuf.Timestamp;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import com.watchtogether.roomservice.service.invitation.InvitationService;
import com.watchtogether.roomservice.service.room.IRoomService;
import com.watchtogether.grpc.*;
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
    private final InvitationService invitationService;

    @Override
    public void getRoomById(GetRoomByIdRequest request,
                            StreamObserver<RoomResponse> responseObserver
    ) {
        var roomEntity = roomService.findRoomById(request.getRoomId());
        responseObserver.onNext(RoomResponse.newBuilder()
                        .setRoomId(roomEntity.getId())
                        .setRoomCreator(RoomParticipant.newBuilder()
                                .setUserId(roomEntity.getOwnerId())
                                .setDisplayName(roomEntity.getParticipant(roomEntity.getOwnerId()).getDisplayName()) //TODO: improve
                                .build())
                        .setRoomName(roomEntity.getName())
                        .setRoomDescription(roomEntity.getDescription())
                        .setRoomType(roomEntity.getType())
                        .setRoomCategory(roomEntity.getCategory())
                        .setMaxParticipants(roomEntity.getMaxParticipants())
                        .setNeedPassword(!roomEntity.getPasswordHash().isEmpty())
                        .setParticipantNumber(roomEntity.getParticipants().size())
                        .setCreatedAt(Timestamp.newBuilder()
                                .setSeconds(roomEntity.getCreatedAt().getEpochSecond())
                                .setNanos(roomEntity.getCreatedAt().getNano())
                                .build())
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void getRoomByOwnerId(GetRoomByOwnerIdRequest request,
                                 StreamObserver<RoomResponse> responseObserver
    ) {
        super.getRoomByOwnerId(request, responseObserver);
    }

    @Override
    public void getAllPublicRooms(Empty request,
                                  StreamObserver<RoomListResponse> responseObserver
    ) {
        List<ActiveRoomEntity> publicRooms = roomService.findAllPublicRooms();
        responseObserver.onNext(RoomListResponse.newBuilder()
                        .addAllRooms(publicRooms
                                .stream()
                                .map(this::mapToGrpcRoomResponse)
                                .toList())
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void getRoomsByCategory(GetRoomsByCategoryRequest request,
                                   StreamObserver<RoomListResponse> responseObserver
    ) {
        List<ActiveRoomEntity> roomList = roomService.findAllRoomsByCategory(request.getRoomCategory());
        responseObserver.onNext(RoomListResponse.newBuilder()
                .addAllRooms(roomList
                        .stream()
                        .map(this::mapToGrpcRoomResponse)
                        .toList())
                .build());
        responseObserver.onCompleted();
    }

    @Override
    public void createRoom(CreateRoomRequest request,
                           StreamObserver<CreateRoomResponse> responseObserver
    ) {
        var createdRoom = roomService.createRoom(request); //TODO: ??
        responseObserver.onNext(CreateRoomResponse.newBuilder()
                        .setSuccess(true)
                        .setMessage("Room created successfully")
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void addParticipantToRoom(AddParticipantRequest request,
                                     StreamObserver<JoinToRoomResponse> responseObserver
    ) { //TODO: ну тут как то надо все же проверять

        JoinToRoomResponse.Builder responseBuilder;

        if (request.getPassword().isEmpty()) {
            responseBuilder = roomService.addParticipantToRoom(request.getRoomId(), request.getParticipant()); //TODO: improve here
            log.info("two par");
            log.info("pass: {}", request.getPassword());
        } else {
            log.info("three par");
            responseBuilder = roomService.addParticipantToRoom(request);
        }

        responseObserver.onNext(
                responseBuilder
                        .setMessage(responseBuilder.getSuccess() ? "Participant joined successfully" : "Participant not joined")
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void removeParticipantFromRoom(RemoveParticipantRequest request,
                                          StreamObserver<RemoveParticipantResponse> responseObserver
    ) {
        boolean success = roomService.removeParticipantFromRoom(request.getRoomId(), request.getParticipantId()); //TODO: ловить искл.
        responseObserver.onNext(RemoveParticipantResponse.newBuilder()
                .setSuccess(success)
                .setMessage(success ? "Participant leaved successfully" : "Participant not leaved")
                .build());
        responseObserver.onCompleted();
    }

    @Override
    public void generateInvitation(GenerateInvitationRequest request, StreamObserver<GenerateInvitationResponse> responseObserver) {

        String code = invitationService.generateInvitation(request);

        responseObserver.onNext(GenerateInvitationResponse.newBuilder()
                        .setSuccess(true)
                        .setLink(code) //TODO: переделывать в ссылку
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void joinRoomByInvite(
            JoinRoomByInviteRequest request,
            StreamObserver<JoinToRoomResponse> responseObserver
    ) {
//        var result = invitationService.joinRoomByInvite(request);
        JoinToRoomResponse.Builder responseBuilder = invitationService.joinRoomByInvite(request);
        responseObserver.onNext(
                responseBuilder
                        .setMessage(responseBuilder.getSuccess() ? "Participant joined successfully" : "Participant not joined")
                        .build());
        responseObserver.onCompleted();
    }



    private RoomResponse mapToGrpcRoomResponse(ActiveRoomEntity entity) {
        return RoomResponse.newBuilder()
                .setRoomId(entity.getId())
                .setRoomCreator(RoomParticipant.newBuilder()
                        .setUserId(entity.getOwnerId())
                        .setDisplayName(entity.getParticipant(entity.getOwnerId()).getDisplayName()) //TODO: improve
                        .build())
                .setRoomName(entity.getName())
                .setRoomDescription(entity.getDescription() != null ? entity.getDescription() : "")
                .setRoomType(entity.getType())
                .setRoomCategory(entity.getCategory())
                .setMaxParticipants(entity.getMaxParticipants())
                .setNeedPassword(!entity.getPasswordHash().isEmpty())
                .setParticipantNumber(entity.getParticipants().size())
                .setCreatedAt(Timestamp.newBuilder()
                        .setSeconds(entity.getCreatedAt().getEpochSecond())
                        .setNanos(entity.getCreatedAt().getNano())
                        .build())
                .build();
    }





}