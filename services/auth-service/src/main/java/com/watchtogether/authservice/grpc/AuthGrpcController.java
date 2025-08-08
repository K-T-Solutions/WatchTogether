package com.watchtogether.authservice.grpc;

import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.EmailAlreadyVerifiedException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import com.watchtogether.authservice.request.VerificationRequest;
import com.watchtogether.authservice.response.AuthenticationResponse;
import com.watchtogether.authservice.service.Otp.IOtpService;
import com.watchtogether.authservice.service.auth.AuthService;
import com.watchtogether.authservice.service.credentials.ICredentialsService;
import com.watchtogether.grpc.AuthServiceProto;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.util.UUID;

@RequiredArgsConstructor
@GrpcService
@Slf4j
public class AuthGrpcController extends com.watchtogether.grpc.AuthServiceGrpc.AuthServiceImplBase {
    private final AuthService authService;
    private final ICredentialsService credentialsService;
    private final IOtpService otpService;

    private void requireNonBlank(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
    }

    private UUID parseUuid(String rawUserId) {
        requireNonBlank(rawUserId, "userId");
        try {
            return UUID.fromString(rawUserId);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("userId must be a valid UUID");
        }
    }

    @Override
    public void registerUser(
            AuthServiceProto.RegisterRequestGrpc request,
            StreamObserver<AuthServiceProto.RegisterResponseGrpc> responseObserver
    ) {
        log.info("Registering user");

        AuthServiceProto.RegisterResponseGrpc response;

        try {
            requireNonBlank(request.getLogin(), "login");
            requireNonBlank(request.getEmail(), "email");
            requireNonBlank(request.getPassword(), "password");
            authService.registerUser(
                    new RegisterRequest(
                            request.getLogin(),
                            request.getEmail(),
                            request.getPassword()));

            response = AuthServiceProto.RegisterResponseGrpc.newBuilder()
                    .setSuccess(true)
                    .setMessage("User registered successfully")
                    .build();
        } catch (LoginAlreadyTakenException | EmailAlreadyTakenException e) {
            response = AuthServiceProto.RegisterResponseGrpc.newBuilder()
                    .setSuccess(false)
                    .setMessage(e.getMessage())
                    .build();
        }

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void login(
            AuthServiceProto.LoginRequestGrpc request,
            StreamObserver<AuthServiceProto.AuthenticateResponseGrpc> responseObserver
    ) {
        requireNonBlank(request.getIdentifier(), "identifier");
        requireNonBlank(request.getPassword(), "password");

        var loginRequest = new LoginRequest(
                request.getIdentifier(),
                request.getPassword()
        );

        AuthenticationResponse loginResponse = authService.login(loginRequest);

        AuthServiceProto.AuthenticateResponseGrpc.Builder responseBuilder =
                AuthServiceProto.AuthenticateResponseGrpc.newBuilder();

        if (loginResponse.isTwoFactorEnabled()) {
            responseBuilder.setTwoFactorRequired(true);
        } else {
            responseBuilder.setToken(loginResponse.getToken());
        }

        responseObserver.onNext(responseBuilder.build());
        responseObserver.onCompleted();
    }

    @Override
    public void validateOtp(
            AuthServiceProto.VerificationRequestGrpc request,
            StreamObserver<AuthServiceProto.AuthenticateResponseGrpc> responseObserver
    ) {
        requireNonBlank(request.getEmail(), "email");
        requireNonBlank(request.getCode(), "code");

        var verificationRequest = new VerificationRequest(
                request.getEmail(),
                request.getCode()
        );

        AuthenticationResponse finalResponse = authService.verifyCode(verificationRequest);
        AuthServiceProto.AuthenticateResponseGrpc grpcResponse = AuthServiceProto.AuthenticateResponseGrpc.newBuilder()
                .setToken(finalResponse.getToken())
                .build();

        responseObserver.onNext(grpcResponse);
        responseObserver.onCompleted();
    }

    @Override
    public void validateJwtToken(
            AuthServiceProto.ValidateTokenRequestGrpc request,
            StreamObserver<AuthServiceProto.ValidateTokenResponseGrpc> responseObserver
    ) {
        requireNonBlank(request.getToken(), "token");
        boolean isValid = authService.validateToken(request.getToken());
        AuthServiceProto.ValidateTokenResponseGrpc response = AuthServiceProto.ValidateTokenResponseGrpc
                .newBuilder()
                .setIsValid(isValid)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateLogin(
            AuthServiceProto.UpdateLoginRequestGrpc request,
            StreamObserver<AuthServiceProto.UpdateCredResponseGrpc> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getLogin(), "login");
        credentialsService.updateLogin(userId, request.getLogin());
        AuthServiceProto.UpdateCredResponseGrpc response = AuthServiceProto.UpdateCredResponseGrpc
                .newBuilder()
                .setMessage("Login updated success")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateEmail(
            AuthServiceProto.UpdateLoginRequestGrpc request,
            StreamObserver<AuthServiceProto.UpdateCredResponseGrpc> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getLogin(), "email");
        credentialsService.updateEmail(userId, request.getLogin());
        AuthServiceProto.UpdateCredResponseGrpc response = AuthServiceProto.UpdateCredResponseGrpc
                .newBuilder()
                .setMessage("Email updated success")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updatePassword(
            AuthServiceProto.UpdatePasswordRequestGrpc request,
            StreamObserver<AuthServiceProto.UpdateCredResponseGrpc> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getOldPass(), "oldPass");
        requireNonBlank(request.getNewPass(), "newPass");
        credentialsService.updatePassword(
                userId,
                request.getOldPass(),
                request.getNewPass());
        AuthServiceProto.UpdateCredResponseGrpc response = AuthServiceProto.UpdateCredResponseGrpc
                .newBuilder()
                .setMessage("Password changed success")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void sendEmailVerificationCode(
            AuthServiceProto.UserIdRequestGrpc request,
            StreamObserver<AuthServiceProto.VerifyEmailResponseGrpc> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        var userEntity = credentialsService.getByUserId(userId);

        if (userEntity.isEmailVerified()) {
            throw new EmailAlreadyVerifiedException("Email is already verified");
        }

        otpService.initiateVerification(userEntity.getEmail());
        AuthServiceProto.VerifyEmailResponseGrpc responseGrpc = AuthServiceProto.VerifyEmailResponseGrpc
                .newBuilder()
                .setResult(true)
                .build();
        responseObserver.onNext(responseGrpc);
        responseObserver.onCompleted();
    }

    @Override
    public void verifyEmailCode(
            AuthServiceProto.VerifyEmailRequestGrpc request,
            StreamObserver<AuthServiceProto.VerifyEmailResponseGrpc> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getCode(), "code");
        var userEntity = credentialsService.getByUserId(userId);
        boolean result = otpService.validateOtp(userEntity.getEmail(), request.getCode());

        AuthServiceProto.VerifyEmailResponseGrpc responseGrpc = AuthServiceProto.VerifyEmailResponseGrpc
                .newBuilder()
                .setResult(result)
                .build();
        responseObserver.onNext(responseGrpc);
        responseObserver.onCompleted();
    }
}
