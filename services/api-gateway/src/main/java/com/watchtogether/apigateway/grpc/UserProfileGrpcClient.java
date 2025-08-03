package com.watchtogether.apigateway.grpc;

import com.watchtogether.grpc.UserServiceGrpc;
import com.watchtogether.grpc.UserServiceProto;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;

@Service
public class UserProfileGrpcClient {

    @GrpcClient("user-profile-service")
    private UserServiceGrpc.UserServiceBlockingStub blockingStub;

    public UserServiceProto.UserResponseGrpc getUserById(String id) {
        return blockingStub.getUserById(
                UserServiceProto.UserIdRequestGrpc
                        .newBuilder()
                        .setId(id)
                        .build());
    }

}
