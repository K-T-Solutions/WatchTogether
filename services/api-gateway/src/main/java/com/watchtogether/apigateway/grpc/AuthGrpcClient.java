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

    public AuthServiceProto.RegisterResponseGrpc registerUser(String login, String email, String password) {
        AuthServiceProto.RegisterRequestGrpc request = AuthServiceProto.RegisterRequestGrpc.newBuilder()
                .setLogin(login)
                .setEmail(email)
                .setPassword(password)
                .build();
        return blockingStub.registerUser(request);
    }

    public AuthServiceProto.AuthenticateResponseGrpc login(String identifier, String password) {
        AuthServiceProto.LoginRequestGrpc request = AuthServiceProto.LoginRequestGrpc.newBuilder()
                .setIdentifier(identifier)
                .setPassword(password)
                .build();
        return blockingStub.login(request);
    }

    public AuthServiceProto.AuthenticateResponseGrpc validateOtp(String email, String code) {
        AuthServiceProto.VerificationRequestGrpc request = AuthServiceProto.VerificationRequestGrpc.newBuilder()
                .setEmail(email)
                .setCode(code)
                .build();
        return blockingStub.validateOtp(request);
    }

    public AuthServiceProto.ValidateTokenResponseGrpc validateToken(String token) {
        AuthServiceProto.ValidateTokenRequestGrpc request = AuthServiceProto.ValidateTokenRequestGrpc.newBuilder()
                .setToken(token)
                .build();
        return blockingStub.validateJwtToken(request);
    }

    public AuthServiceProto.UpdateCredResponseGrpc updateUserLogin(String userId, String login) {
        AuthServiceProto.UpdateLoginRequestGrpc requestGrpc = AuthServiceProto.UpdateLoginRequestGrpc
                .newBuilder()
                .setUserId(userId)
                .setLogin(login)
                .build();
        return blockingStub.updateLogin(requestGrpc);
    }

    public AuthServiceProto.UpdateCredResponseGrpc updateUserEmail(String userId, String email) {
        AuthServiceProto.UpdateLoginRequestGrpc requestGrpc = AuthServiceProto.UpdateLoginRequestGrpc
                .newBuilder()
                .setUserId(userId)
                .setLogin(email)
                .build();
        return blockingStub.updateEmail(requestGrpc);
    }

    public AuthServiceProto.UpdateCredResponseGrpc updateUserPassword(String userId, String oldPass, String newPass) {
        AuthServiceProto.UpdatePasswordRequestGrpc request = AuthServiceProto.UpdatePasswordRequestGrpc
                .newBuilder()
                .setUserId(userId)
                .setOldPass(oldPass)
                .setNewPass(newPass)
                .build();
        return blockingStub.updatePassword(request);
    }

    public AuthServiceProto.VerifyEmailResponseGrpc sendEmailVerificationCode(String userId) {
        AuthServiceProto.AuthUserIdRequestGrpc request = AuthServiceProto.AuthUserIdRequestGrpc
                .newBuilder()
                .setUserId(userId)
                .build();
        return blockingStub.sendEmailVerificationCode(request);
    }

    public AuthServiceProto.VerifyEmailResponseGrpc verifyEmailCode(String userId, String code) {
        AuthServiceProto.VerifyEmailRequestGrpc request = AuthServiceProto.VerifyEmailRequestGrpc
                .newBuilder()
                .setUserId(userId)
                .setCode(code)
                .build();
        return blockingStub.verifyEmailCode(request);
    }

}
