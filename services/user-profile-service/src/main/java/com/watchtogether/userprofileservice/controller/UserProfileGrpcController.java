package com.watchtogether.userprofileservice.controller;

import com.watchtogether.grpc.UserServiceGrpc;
import com.watchtogether.grpc.UserServiceProto;
import com.watchtogether.userprofileservice.request.UpdateUserProfileRequest;
import com.watchtogether.userprofileservice.service.IUserProfileService;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@GrpcService
public class UserProfileGrpcController extends UserServiceGrpc.UserServiceImplBase {

    private final IUserProfileService userProfileService;

    @Override
    public void getUserById(UserServiceProto.UserIdRequestGrpc request, StreamObserver<UserServiceProto.UserResponseGrpc> responseObserver) {
        log.info("gRPC getUserById: {}", request.getUserId());
        var userEntity = userProfileService.findUserProfileById(UUID.fromString(request.getUserId()));
        UserServiceProto.UserResponseGrpc response = UserServiceProto.UserResponseGrpc
                .newBuilder()
                .setUserId(userEntity.getUserId().toString())
                .setLogin(userEntity.getLogin())
                .setDisplayName(userEntity.getDisplayName())
                .setBio(userEntity.getBio() != null ? userEntity.getBio() : "")
                .setDisplayEmail(userEntity.getDisplayEmail()) //TODO: тут с почтой что то придумать
                .setJoinDate(userEntity.getCreatedAt().toString())
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateUserProfileById(UserServiceProto.UpdateUserProfileRequestGrpc request, StreamObserver<UserServiceProto.UserResponseGrpc> responseObserver) {
        log.info("gRPC updateUserProfileById: {}", request.getUserId());
        var UserEntity = userProfileService.updateUserProfileById(
                new UpdateUserProfileRequest(
                        request.getDisplayName(),
                        request.getDisplayEmail(),
                        request.getBio()
                        ), UUID.fromString(request.getUserId()));
        UserServiceProto.UserResponseGrpc response = UserServiceProto.UserResponseGrpc
                .newBuilder()
                .setUserId(UserEntity.getUserId().toString())
                .setLogin(UserEntity.getLogin())
                .setDisplayName(UserEntity.getDisplayName())
                .setBio(UserEntity.getBio())
                .setDisplayEmail(UserEntity.getDisplayEmail())
                .setJoinDate(UserEntity.getCreatedAt().toString())
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
