package com.watchtogether.apigateway.grpc;

import com.watchtogether.apigateway.enums.GraphQLRoomCategory;
import com.watchtogether.apigateway.graphql.input.AddParticipantUnput;
import com.watchtogether.apigateway.graphql.input.CreateRoomInput;
import com.watchtogether.apigateway.util.RoomMapper;
import com.watchtogether.grpc.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.stereotype.Service;
import com.google.protobuf.Empty;

@Slf4j
@RequiredArgsConstructor
@Service
public class RoomGrpcClient {
    private final RoomMapper roomMapper;

    @GrpcClient("room-service")
    private RoomServiceGrpc.RoomServiceBlockingStub blockingStub;

    public RoomResponse getRoomById(String roomId) {
        return blockingStub.getRoomById(
                GetRoomByIdRequest.newBuilder()
                        .setRoomId(roomId).build());
    }

    public RoomResponse getRoomByOwnerId(String ownerId) {
        return blockingStub.getRoomByOwnerId(
                GetRoomByOwnerIdRequest.newBuilder()
                        .setOwnerId(ownerId).build());
    }

    public RoomListResponse getAllPublicRooms() {
        return blockingStub.getAllPublicRooms(Empty.getDefaultInstance());
    }

    public RoomListResponse getRoomsByCategory(@Argument GraphQLRoomCategory category) {
        return blockingStub.getRoomsByCategory(GetRoomsByCategoryRequest.newBuilder()
                        .setRoomCategory(roomMapper.mapCategoryToGrpc(category))
                        .build());
    }

    public CreateRoomResponse createRoom(CreateRoomInput dto) {
        return blockingStub.createRoom(com.watchtogether.grpc.CreateRoomRequest
                    .newBuilder()
                        .setRoomCreator(RoomParticipant.newBuilder()
                                .setUserId(dto.getOwnerId())
                                .setDisplayName(dto.getOwnerDisplayName())
                                .build())
                        .setRoomName(dto.getRoomName())
                        .setRoomDescription(dto.getRoomDescription())
                        .setRoomType(roomMapper.mapTypeToGrpc(dto.getRoomType()))
                        .setCategory(roomMapper.mapCategoryToGrpc(dto.getRoomCategory()))
                        .setRoomPassword(dto.getRoomPassword())
                        .setMaxParticipants(dto.getMaxParticipants())
                        .build());
    }

    public JoinToRoomResponse addParticipant(AddParticipantUnput request) { //TODO: add password
        return blockingStub.addParticipantToRoom(AddParticipantRequest
                .newBuilder()
                        .setRoomId(request.getRoomId().toString())
                        .setParticipant(RoomParticipant.newBuilder()
                                .setUserId(request.getParticipantId().toString())
                                .setDisplayName(request.getParticipantDisplayName())
                                .build())
                        .setPassword(request.getPassword())
                        .build());
    }

    public RemoveParticipantResponse removeParticipant(String roomId, String participantId) {
        return blockingStub.removeParticipantFromRoom(RemoveParticipantRequest
                .newBuilder()
                .setRoomId(roomId)
                .setParticipantId(participantId)
                .build());
    }

    public GenerateInvitationResponse generateInvitation(GenerateInvitationRequest request) {
        return blockingStub.generateInvitation(request);
    }

    public JoinToRoomResponse joinRoomByInvite(String inviteCode, String userId, String userName) {
        return blockingStub.joinRoomByInvite(JoinRoomByInviteRequest.newBuilder()
                        .setInviteCode(inviteCode)
                        .setParticipant(RoomParticipant.newBuilder()
                                .setUserId(userId)
                                .setDisplayName(userName)
                                .build())
                        .build());
    }

}
