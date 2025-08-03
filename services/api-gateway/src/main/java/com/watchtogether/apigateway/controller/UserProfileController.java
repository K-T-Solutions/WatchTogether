package com.watchtogether.apigateway.controller;

import com.watchtogether.apigateway.grpc.UserProfileGrpcClient;
import com.watchtogether.grpc.UserServiceProto;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.UUID;

@RequiredArgsConstructor
@Controller
@CrossOrigin(origins = "http://localhost:5173")
public class UserProfileController {

    private final UserProfileGrpcClient grpcClient;

    @QueryMapping
    public UserServiceProto.UserResponseGrpc getUserProfileById(@Argument UUID userId) {
        return grpcClient.getUserById(userId.toString());
    }

}
