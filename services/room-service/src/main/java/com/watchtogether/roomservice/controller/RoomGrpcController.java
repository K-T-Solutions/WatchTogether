package com.watchtogether.roomservice.controller;

import com.google.protobuf.Empty;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import com.watchtogether.roomservice.service.invitation.InvitationService;
import com.watchtogether.roomservice.service.room.IRoomService;
import com.watchtogether.grpc.*;
import com.watchtogether.roomservice.util.RoomMapper;
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
    private final RoomMapper roomMapper;

    @Override
    public void getRoomById(GetRoomByIdRequest request,
                            StreamObserver<RoomResponse> responseObserver
    ) {
        var roomEntity = roomService.findRoomById(request.getRoomId());
        responseObserver.onNext(roomMapper.mapRoomToGrpc(roomEntity));
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
                                .map(roomMapper::mapRoomToGrpc)
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
                        .map(roomMapper::mapRoomToGrpc)
                        .toList())
                .build());
        responseObserver.onCompleted();
    }

    @Override
    public void createRoom(CreateRoomRequest request, StreamObserver<JoinToRoomResponse> responseObserver) {
        var createdRoom = roomService.createRoom(request); //TODO: ??

        JoinToRoomResponse.Builder builder = roomMapper.mapJoinToRoomResponseToGrpc(createdRoom);

        responseObserver.onNext(builder
                        .setMessage("Room created successfully")
                        .build());
        responseObserver.onCompleted();
    }

    @Override
    public void addParticipantToRoom(AddParticipantRequest request,
                                     StreamObserver<JoinToRoomResponse> responseObserver
    ) { //TODO: ну тут как то надо все же проверять

        JoinToRoomResponse.Builder responseBuilder;

        responseBuilder = roomService.joinToRoom(request);


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
    public void validateInvitation(
            ValidateInvitationRequest request,
            StreamObserver<ValidateInvitationResponse> responseObserver
    ) {

        var grpcResponse = invitationService.validateInvitationCode(request.getCode(), request.getUserId());
        responseObserver.onNext(grpcResponse);
        responseObserver.onCompleted();
    }

    @Override
    public void joinToRoomByInvite(
            JoinToRoomByInviteRequest request,
            StreamObserver<JoinToRoomResponse> responseObserver
    ) {
        JoinToRoomResponse.Builder responseBuilder = invitationService.joinToRoomByInvitation(request);
        responseObserver.onNext(
                responseBuilder
                        .setMessage(responseBuilder.getSuccess() ? "Participant joined successfully" : "Participant not joined")
                        .build());
        responseObserver.onCompleted();
    }


}