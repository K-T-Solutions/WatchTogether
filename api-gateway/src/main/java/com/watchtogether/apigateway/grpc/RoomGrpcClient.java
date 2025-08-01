package com.watchtogether.apigateway.grpc;

import com.watchtogether.grpc.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class RoomGrpcClient {

    @GrpcClient("room-service")
    private RoomServiceGrpc.RoomServiceBlockingStub blockingStub;

    public RoomResponseGrpc getRoomById(String id) {
        return blockingStub.getRoomById(
                RoomIdRequestGrpc.newBuilder()
                .setRoomId(id)
                .build());
    }

    public RoomListResponseGrpc getAllRooms() {
        return blockingStub.getAllRooms(
                EmptyGrpc.newBuilder()
                        .build());
    }

    public RoomListResponseGrpc getAllRoomsByCategory(String category) {
        return blockingStub.getRoomsByCategory(
                CategoryRequestGrpc.newBuilder()
                        .setCategory(category)
                        .build());
    }

    public RoomResponseGrpc createRoom(CreateRoomRequestGrpc request) {
        return blockingStub.createRoom(request);
    }

}
