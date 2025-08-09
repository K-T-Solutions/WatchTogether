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

    @GrpcClient("auth-service")
    private AuthServiceGrpc.AuthServiceBlockingStub blockingStub;

    public AuthServiceProto.RegisterResponse registerUser(String login, String email, String password) {
        AuthServiceProto.RegisterRequest request = AuthServiceProto.RegisterRequest.newBuilder()
                .setLogin(login)
                .setEmail(email)
                .setPassword(password)
                .build();
        return blockingStub.registerUser(request);
    }

    public AuthServiceProto.AuthenticateResponse login(String identifier, String password) {
        AuthServiceProto.LoginRequest request = AuthServiceProto.LoginRequest.newBuilder()
                .setIdentifier(identifier)
                .setPassword(password)
                .build();
        return blockingStub.login(request);
    }

    public AuthServiceProto.AuthenticateResponse validateOtp(String login, String code) {
        AuthServiceProto.VerificationRequest request = AuthServiceProto.VerificationRequest.newBuilder()
                .setLogin(login)
                .setCode(code)
                .build();
        return blockingStub.validateOtp(request);
    }

    public AuthServiceProto.ValidateTokenResponse validateToken(String token) {
        AuthServiceProto.ValidateTokenRequest request = AuthServiceProto.ValidateTokenRequest.newBuilder()
                .setToken(token)
                .build();
        return blockingStub.validateJwtToken(request);
    }

    public AuthServiceProto.UpdateCredResponse updateUserLogin(String userId, String login) {
        AuthServiceProto.UpdateLoginRequest requestGrpc = AuthServiceProto.UpdateLoginRequest
                .newBuilder()
                .setUserId(userId)
                .setLogin(login)
                .build();
        return blockingStub.updateLogin(requestGrpc);
    }

    public AuthServiceProto.UpdateCredResponse updateUserEmail(String userId, String email) {
        AuthServiceProto.UpdateEmailRequest requestGrpc = AuthServiceProto.UpdateEmailRequest
                .newBuilder()
                .setUserId(userId)
                .setEmail(email)
                .build();
        return blockingStub.updateEmail(requestGrpc);
    }

    public AuthServiceProto.UpdateCredResponse updateUserPassword(String userId, String oldPass, String newPass) {
        AuthServiceProto.UpdatePasswordRequest request = AuthServiceProto.UpdatePasswordRequest
                .newBuilder()
                .setUserId(userId)
                .setOldPassword(oldPass)
                .setNewPassword(newPass)
                .build();
        return blockingStub.updatePassword(request);
    }

    public AuthServiceProto.VerifyEmailResponse initiateEmailVerification(String userId) {
        AuthServiceProto.UserIdRequest request = AuthServiceProto.UserIdRequest
                .newBuilder()
                .setUserId(userId)
                .build();
        return blockingStub.initiateEmailVerification(request);
    }

    public AuthServiceProto.VerifyEmailResponse finishEmailVerification(String userId, String code) {
        AuthServiceProto.VerifyEmailRequest request = AuthServiceProto.VerifyEmailRequest
                .newBuilder()
                .setUserId(userId)
                .setCode(code)
                .build();
        return blockingStub.finishEmailVerification(request);
    }

    public AuthServiceProto.UserCredResponse getUserCred(String userId) {
        return blockingStub.
                getUserCredentials(AuthServiceProto.UserIdRequest
                        .newBuilder()
                        .setUserId(userId)
                        .build());
    }

    public AuthServiceProto.EnableTwoFactorResponse enableTwoFactor(String userId) {
        return blockingStub.enableTwoFactor(
                AuthServiceProto.UserIdRequest
                        .newBuilder()
                        .setUserId(userId)
                        .build()
        );
    }

}
