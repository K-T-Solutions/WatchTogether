package com.watchtogether.apigateway.grpc;

import com.watchtogether.apigateway.graphql.input.UpdateUserProfileRequest;
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
                        .setUserId(id)
                        .build());
    }

    public UserServiceProto.UserResponseGrpc updateUserProfileById(UpdateUserProfileRequest request) {
        return blockingStub.updateUserProfileById(
                UserServiceProto.UpdateUserProfileRequestGrpc
                        .newBuilder()
                        .setUserId(request.getUserId())
                        .setDisplayName(request.getDisplayName())
                        .setDisplayEmail(request.getDisplayEmail())
                        .setBio(request.getBio())
                        .build()
        );
    }
}
