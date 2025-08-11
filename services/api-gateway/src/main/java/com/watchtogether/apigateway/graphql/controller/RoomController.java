package com.watchtogether.apigateway.graphql.controller;

import com.watchtogether.apigateway.dto.CreateRoomDto;
import com.watchtogether.apigateway.enums.GraphQLRoomCategory;
import com.watchtogether.apigateway.enums.GraphQLRoomType;
import com.watchtogether.apigateway.grpc.RoomGrpcClient;
import com.watchtogether.apigateway.util.RoomMapper;
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
                grpcResponse.getNeedPassword());
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
                grpcResponse.getNeedPassword());
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
                        room.getNeedPassword())).toList();
    }

    @MutationMapping
    public CreateRoomResponse createRoom(@Argument CreateRoomDto request) {
        var grpcResponse = roomGrpcClient.createRoom(request);


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

    public record RoomResponse(
                        String roomId,
                        String ownerId,
                        String roomName,
                        String roomDescription,
                        GraphQLRoomType roomType,
                        GraphQLRoomCategory roomCategory,
                        int maxParticipants,
                        boolean needPassword) {}

    public record CreateRoomResponse(Boolean success,
                                     String message) {}

}
