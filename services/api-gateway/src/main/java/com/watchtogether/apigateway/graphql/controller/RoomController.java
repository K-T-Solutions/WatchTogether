package com.watchtogether.apigateway.graphql.controller;

import com.google.protobuf.Duration;
import com.watchtogether.apigateway.enums.GraphQLRoomCategory;
import com.watchtogether.apigateway.enums.GraphQLRoomType;
import com.watchtogether.apigateway.graphql.input.CreateRoomInput;
import com.watchtogether.apigateway.graphql.input.GenerateInvitationInput;
import com.watchtogether.apigateway.grpc.RoomGrpcClient;
import com.watchtogether.apigateway.util.RoomMapper;
import com.watchtogether.grpc.GenerateInvitationRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {
    private final RoomGrpcClient roomGrpcClient;
    private final RoomMapper roomMapper;

    @QueryMapping
    public RoomResponse getRoomById(@Argument UUID roomId) {
        var grpcResponse = roomGrpcClient.getRoomById(roomId.toString());
        return new RoomResponse(
                grpcResponse.getRoomId(),
                grpcResponse.getOwnerId(),
                grpcResponse.getRoomName(),
                grpcResponse.getRoomDescription(),
                roomMapper.mapTypeToGraphQL(grpcResponse.getRoomType()),
                roomMapper.mapCategoryToGraphQL(grpcResponse.getRoomCategory()),
                grpcResponse.getMaxParticipants(),
                grpcResponse.getNeedPassword(),
                grpcResponse.getParticipantNumber(),
                grpcResponse.getCreatedAt().toString());
    }

    @QueryMapping
    public RoomResponse getRoomByOwnerId(@Argument UUID ownerId) {
        var grpcResponse = roomGrpcClient.getRoomByOwnerId(ownerId.toString());
        return new RoomResponse(
                grpcResponse.getRoomId(),
                grpcResponse.getOwnerId(),
                grpcResponse.getRoomName(),
                grpcResponse.getRoomDescription(),
                roomMapper.mapTypeToGraphQL(grpcResponse.getRoomType()),
                roomMapper.mapCategoryToGraphQL(grpcResponse.getRoomCategory()),
                grpcResponse.getMaxParticipants(),
                grpcResponse.getNeedPassword(),
                grpcResponse.getParticipantNumber(),
                grpcResponse.getCreatedAt().toString());
    }

    @QueryMapping
    public List<RoomResponse> getAllPublicRooms() {
        var grpcResponse = roomGrpcClient.getAllPublicRooms();
        return grpcResponse.getRoomsList()
                .stream()
                .map(room -> new RoomResponse(
                        room.getRoomId(),
                        room.getOwnerId(),
                        room.getRoomName(),
                        room.getRoomDescription(),
                        roomMapper.mapTypeToGraphQL(room.getRoomType()),
                        roomMapper.mapCategoryToGraphQL(room.getRoomCategory()),
                        room.getMaxParticipants(),
                        room.getNeedPassword(),
                        room.getParticipantNumber(),
                        room.getCreatedAt().toString())).toList();
    }

    @QueryMapping
    List<RoomResponse> getRoomsByCategory(@Argument GraphQLRoomCategory category) {
        var grpcResponse = roomGrpcClient.getRoomsByCategory(category);
        return grpcResponse.getRoomsList()
                .stream()
                .map(room -> new RoomResponse(
                        room.getRoomId(),
                        room.getOwnerId(),
                        room.getRoomName(),
                        room.getRoomDescription(),
                        roomMapper.mapTypeToGraphQL(room.getRoomType()),
                        roomMapper.mapCategoryToGraphQL(room.getRoomCategory()),
                        room.getMaxParticipants(),
                        room.getNeedPassword(),
                        room.getParticipantNumber(),
                        room.getCreatedAt().toString())).toList();
    }

    @MutationMapping
    public CreateRoomResponse createRoom(@Argument CreateRoomInput input) {
        var grpcResponse = roomGrpcClient.createRoom(input);

        return new CreateRoomResponse(
                grpcResponse.getSuccess(),
                grpcResponse.getMessage());
    }

    @MutationMapping //TODO: change
    public boolean addParticipantToRoom(@Argument UUID roomId,
                                        @Argument UUID participantId,
                                        @Argument String password
    ) {
        return roomGrpcClient.addParticipant(roomId.toString(), participantId.toString(), password).getSuccess();
    }

    @MutationMapping
    public boolean removeParticipantFromRoom(@Argument UUID roomId,
                                             @Argument UUID participantId
    ) {
        return roomGrpcClient.removeParticipant(roomId.toString(), participantId.toString())
                .getSuccess();
    }

    @MutationMapping
    public GenerateInvitationResponse generateInvitation(@Argument GenerateInvitationInput input) {

        var grpcResponse = roomGrpcClient.generateInvitation(GenerateInvitationRequest
                .newBuilder()
                .setRoomId(input.getRoomId().toString())
                .setCreatorId(input.getCreatorId().toString())
                .setDurationSecs(Duration.newBuilder().setSeconds(input.getDurationSecs()).build())
                .setMaxUses(input.getMaxUses())
                .build());

        return new GenerateInvitationResponse(
                grpcResponse.getSuccess(),
                grpcResponse.getLink());
    }

    @QueryMapping
    public boolean joinRoomByInvite(@Argument String inviteCode, @Argument UUID userId) {

        var grpcResponse = roomGrpcClient.joinRoomByInvite(inviteCode, userId.toString());
        return grpcResponse.getSuccess();
    }

    public record RoomResponse(
            String roomId,
            String ownerId,
            String roomName,
            String roomDescription,
            GraphQLRoomType roomType,
            GraphQLRoomCategory roomCategory,
            int maxParticipants,
            boolean needPassword,
            int participantsNumber,
            String createdAt) {
    }

    public record CreateRoomResponse(Boolean success,
                                     String message) {
    }

    public record GenerateInvitationResponse(Boolean success,
                                             String code) {
    }

}
