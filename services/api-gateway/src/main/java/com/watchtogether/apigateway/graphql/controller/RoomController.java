package com.watchtogether.apigateway.graphql.controller;

import com.google.protobuf.Duration;
import com.watchtogether.apigateway.enums.GraphQLRoomCategory;
import com.watchtogether.apigateway.enums.GraphQLRoomType;
import com.watchtogether.apigateway.graphql.input.AddParticipantUnput;
import com.watchtogether.apigateway.graphql.input.CreateRoomInput;
import com.watchtogether.apigateway.graphql.input.GenerateInvitationInput;
import com.watchtogether.apigateway.graphql.input.JoinToRoomByInviteInput;
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

    private final static String APP_DOMAIN = "http://localhost:5173/";
    private final static String INVITE_SUBJECT = "invite/";

    @QueryMapping
    public RoomResponse getRoomById(@Argument UUID roomId) {
        var grpcResponse = roomGrpcClient.getRoomById(roomId.toString());
        return roomMapper.mapRoomToGraphQL(grpcResponse);
    }

    @QueryMapping
    public RoomResponse getRoomByOwnerId(@Argument UUID ownerId) {
        var grpcResponse = roomGrpcClient.getRoomByOwnerId(ownerId.toString());
        return roomMapper.mapRoomToGraphQL(grpcResponse);
    }

    @QueryMapping
    public List<RoomResponse> getAllPublicRooms() {
        var grpcResponse = roomGrpcClient.getAllPublicRooms();
        return grpcResponse.getRoomsList()
                .stream()
                .map(roomMapper::mapRoomToGraphQL)
                .toList();
    }

    @QueryMapping
    List<RoomResponse> getRoomsByCategory(@Argument GraphQLRoomCategory category) {
        var grpcResponse = roomGrpcClient.getRoomsByCategory(category);
        return grpcResponse.getRoomsList()
                .stream()
                .map(roomMapper::mapRoomToGraphQL)
                .toList();
    }

    @MutationMapping
    public JoinRoomResponse createRoom(@Argument CreateRoomInput input) {
        var grpcResponse = roomGrpcClient.createRoom(input);

        return new JoinRoomResponse(
                grpcResponse.getSuccess(),
                grpcResponse.getMessage(),
                grpcResponse.getRoomId(),
                grpcResponse.getRoomName(),
                grpcResponse.getRoomDescription(),
                roomMapper.mapTypeToGraphQL(grpcResponse.getRoomType()),
                roomMapper.mapCategoryToGraphQL(grpcResponse.getRoomCategory()),
                grpcResponse.getMaxParticipants(),
                grpcResponse.getParticipantNumber(),
                grpcResponse.getCreatedAt().toString(),
                grpcResponse.getRoomParticipantsList()
                        .stream()
                        .map(roomMapper::mapParticipantToGraphQL)
                        .toList());
    }

    @MutationMapping
    public JoinRoomResponse joinToRoom(@Argument AddParticipantUnput request) {
        var grpcResponse = roomGrpcClient.addParticipant(request);

        return new JoinRoomResponse(
                grpcResponse.getSuccess(),
                grpcResponse.getMessage(),
                grpcResponse.getRoomId(),
                grpcResponse.getRoomName(),
                grpcResponse.getRoomDescription(),
                roomMapper.mapTypeToGraphQL(grpcResponse.getRoomType()),
                roomMapper.mapCategoryToGraphQL(grpcResponse.getRoomCategory()),
                grpcResponse.getMaxParticipants(),
                grpcResponse.getParticipantNumber(),
                grpcResponse.getCreatedAt().toString(),
                grpcResponse.getRoomParticipantsList()
                        .stream()
                        .map(roomMapper::mapParticipantToGraphQL)
                        .toList());
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

        String inviteLink = APP_DOMAIN + INVITE_SUBJECT + grpcResponse.getLink();

        return new GenerateInvitationResponse(
                grpcResponse.getSuccess(),
                inviteLink);
    }

    @QueryMapping
    public ValidateInvitationResponse validateInvitation(@Argument String inviteCode,
                                                         @Argument UUID userId
    ) {
        var grpcResponse = roomGrpcClient.validateInvitation(inviteCode, userId.toString());
        return new ValidateInvitationResponse(
                grpcResponse.getSuccess(),
                grpcResponse.getMessage(),
                roomMapper.mapRoomToGraphQL(grpcResponse.getRoom()));
    }

    @MutationMapping
    public JoinRoomResponse joinToRoomByInvite(@Argument JoinToRoomByInviteInput input) {
        var grpcResponse = roomGrpcClient.joinToRoomByInvite(input);

        return new JoinRoomResponse(
                grpcResponse.getSuccess(),
                grpcResponse.getMessage(),
                grpcResponse.getRoomId(),
                grpcResponse.getRoomName(),
                grpcResponse.getRoomDescription(),
                roomMapper.mapTypeToGraphQL(grpcResponse.getRoomType()),
                roomMapper.mapCategoryToGraphQL(grpcResponse.getRoomCategory()),
                grpcResponse.getMaxParticipants(),
                grpcResponse.getParticipantNumber(),
                grpcResponse.getCreatedAt().toString(),
                grpcResponse.getRoomParticipantsList()
                        .stream()
                        .map(roomMapper::mapParticipantToGraphQL)
                        .toList());
    }

    public record RoomResponse(
            String roomId,
            RoomParticipant roomCreator,
            String roomName,
            String roomDescription,
            GraphQLRoomType roomType,
            GraphQLRoomCategory roomCategory,
            int maxParticipants,
            boolean needPassword,
            int participantsNumber,
            String createdAt) {
    }

    public record RoomParticipant(String userId,
                                  String displayName) {}

    public record CreateRoomResponse(Boolean success,
                                     String message) {
    }

    public record GenerateInvitationResponse(Boolean success,
                                             String code) {
    }

    public record JoinRoomResponse(boolean success,
                                   String message,
                                   String roomId,
                                   String roomName,
                                   String roomDescription,
                                   GraphQLRoomType roomType,
                                   GraphQLRoomCategory roomCategory,
                                   int maxParticipants,
                                   int participantsNumber,
                                   String createdAt,
                                   List<RoomParticipant> roomParticipants) {}

    public record ValidateInvitationResponse(boolean success,
                                             String message,
                                             RoomResponse room) {}

}
