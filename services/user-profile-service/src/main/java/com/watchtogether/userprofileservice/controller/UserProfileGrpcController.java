package com.watchtogether.userprofileservice.controller;

import com.watchtogether.grpc.UserServiceGrpc;
import com.watchtogether.grpc.UserServiceProto;
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
        log.info("gRPC getUserById: {}", request.getId());
        var userEntity = userProfileService.findUserProfileById(UUID.fromString(request.getId()));
        UserServiceProto.UserResponseGrpc response = UserServiceProto.UserResponseGrpc
                .newBuilder()
                .setId(userEntity.getUserId().toString())
                .setLogin(userEntity.getLogin())
                .setDisplayName(userEntity.getDisplayName())
                .setBio(userEntity.getBio() != null ? userEntity.getBio() : "")
                .setDisplayEmail(userEntity.getDisplayEmail()) //TODO: тут с почтой что то придумать
                .setJoinDate(userEntity.getCreatedAt().toString())
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }



}
