package com.watchtogether.apigateway.controller;

import com.watchtogether.apigateway.grpc.RoomGrpcClient;
import com.watchtogether.grpc.CreateRoomRequestGrpc;
import com.watchtogether.grpc.RoomCategoryGrpc;
import com.watchtogether.grpc.RoomListResponseGrpc;
import com.watchtogether.grpc.RoomResponseGrpc;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {
    private final RoomGrpcClient roomGrpcClient;

    @QueryMapping
    public RoomResponseGrpc getRoomById(@Argument UUID roomId) {
        return roomGrpcClient.getRoomById(roomId.toString());
    }

    @QueryMapping
    public RoomListResponseGrpc getAllRooms() {
        return roomGrpcClient.getAllRooms();
    }

    @QueryMapping
    public RoomListResponseGrpc getRoomsByCategory(@Argument RoomCategoryGrpc category) {
        return null; //TODO: impl
    }

    @MutationMapping
    public RoomResponseGrpc createRoom(@Argument CreateRoomRequestGrpc request) {
        return roomGrpcClient.createRoom(request);
    }


}
