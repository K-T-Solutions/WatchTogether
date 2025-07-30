package com.watchtogether.authservice.grpc;

import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import com.watchtogether.authservice.service.auth.AuthService;
import com.watchtogether.grpc.AuthServiceProto;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.Optional;

@RequiredArgsConstructor
@GrpcService
public class AuthGrpcService extends com.watchtogether.grpc.AuthServiceGrpc.AuthServiceImplBase {
    private final AuthService authService;

    @Override
    public void registerUser(
            AuthServiceProto.RegisterRequest request,
            StreamObserver<AuthServiceProto.RegisterResponse> responseObserver
    ) {
        AuthServiceProto.RegisterResponse response;

        try {
            authService.registerUser(
                    new RegisterRequest(
                            request.getLogin(),
                            request.getEmail(),
                            request.getPassword()));

            response = AuthServiceProto.RegisterResponse.newBuilder().setSuccess(true).build();
        } catch (LoginAlreadyTakenException | EmailAlreadyTakenException e) {
            response = AuthServiceProto.RegisterResponse.newBuilder()
                    .setSuccess(false)
                    .setErrorMessage(e.getMessage())
                    .build();
        }

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void authenticate(
            AuthServiceProto.LoginRequest request,
            StreamObserver<AuthServiceProto.AuthenticateResponse> responseObserver
    ) {

        Optional<String> tokenOpt = authService.authenticate(
                new LoginRequest(
                        request.getIdentifier(),
                        request.getPassword()));

        AuthServiceProto.AuthenticateResponse response = tokenOpt
                .map(token ->
                        AuthServiceProto.AuthenticateResponse.newBuilder()
                                .setToken(token)
                                .build())
                .orElse(AuthServiceProto.AuthenticateResponse.newBuilder().build());

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void validateToken(
            AuthServiceProto.ValidateTokenRequest request,
            StreamObserver<AuthServiceProto.ValidateTokenResponse> responseObserver
    ) {
        boolean isValid = authService.validateToken(request.getToken());
        AuthServiceProto.ValidateTokenResponse response = AuthServiceProto.ValidateTokenResponse
                .newBuilder()
                .setIsValid(isValid)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
