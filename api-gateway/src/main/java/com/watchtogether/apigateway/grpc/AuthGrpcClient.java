package com.watchtogether.apigateway.grpc;

import com.watchtogether.grpc.AuthServiceGrpc;
import com.watchtogether.grpc.AuthServiceProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;


@Slf4j
@RequiredArgsConstructor
@Component
public class AuthGrpcClient {

    @GrpcClient("authGrpcService")
    private AuthServiceGrpc.AuthServiceBlockingStub blockingStub;

    public AuthServiceProto.RegisterResponse registerUser(String login, String email, String password) {
        AuthServiceProto.RegisterRequest request = AuthServiceProto.RegisterRequest.newBuilder()
                .setLogin(login)
                .setEmail(email)
                .setPassword(password)
                .build();
        return blockingStub.registerUser(request);
    }

    public AuthServiceProto.AuthenticateResponse authenticate(String identifier, String password) {
        AuthServiceProto.LoginRequest request = AuthServiceProto.LoginRequest.newBuilder()
                .setIdentifier(identifier)
                .setPassword(password)
                .build();
        return blockingStub.authenticate(request);
    }

    public AuthServiceProto.ValidateTokenResponse validateToken(String token) {
        AuthServiceProto.ValidateTokenRequest request = AuthServiceProto.ValidateTokenRequest.newBuilder()
                .setToken(token)
                .build();
        return blockingStub.validateToken(request);
    }
}
