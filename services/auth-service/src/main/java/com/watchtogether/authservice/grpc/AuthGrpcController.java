package com.watchtogether.authservice.grpc;

import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.EmailAlreadyVerifiedException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.request.LoginRequest;
import com.watchtogether.authservice.request.RegisterRequest;
import com.watchtogether.authservice.request.VerificationRequest;
import com.watchtogether.authservice.response.AuthenticationResponse;
import com.watchtogether.authservice.service.Otp.IOtpService;
import com.watchtogether.authservice.service.TwoFactorAuth.ITwoFactorAuthService;
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
    private final ITwoFactorAuthService twoFactorAuthService;
    private final IOtpService otpService;

    @Override
    public void registerUser(
            AuthServiceProto.RegisterRequest request,
            StreamObserver<AuthServiceProto.RegisterResponse> responseObserver
    ) {
        AuthServiceProto.RegisterResponse response;
        try {
            requireNonBlank(request.getLogin(), "login");
            requireNonBlank(request.getEmail(), "email");
            requireNonBlank(request.getPassword(), "password");
            authService.registerUser(
                    new RegisterRequest(
                            request.getLogin(),
                            request.getEmail(),
                            request.getPassword()));

            response = AuthServiceProto.RegisterResponse.newBuilder()
                    .setSuccess(true)
                    .setMessage("User registered successfully")
                    .build();
        } catch (LoginAlreadyTakenException | EmailAlreadyTakenException e) {
            response = AuthServiceProto.RegisterResponse.newBuilder()
                    .setSuccess(false)
                    .setMessage(e.getMessage())
                    .build();
        }

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void login(
            AuthServiceProto.LoginRequest request,
            StreamObserver<AuthServiceProto.AuthenticateResponse> responseObserver
    ) {
        requireNonBlank(request.getIdentifier(), "identifier");
        requireNonBlank(request.getPassword(), "password");

        var loginRequest = new LoginRequest(
                request.getIdentifier(),
                request.getPassword()
        );

        AuthenticationResponse loginResponse = authService.login(loginRequest);
        AuthServiceProto.AuthenticateResponse.Builder responseBuilder =
                AuthServiceProto.AuthenticateResponse.newBuilder();

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
            AuthServiceProto.VerificationRequest request,
            StreamObserver<AuthServiceProto.AuthenticateResponse> responseObserver
    ) {
        requireNonBlank(request.getLogin(), "login");
        requireNonBlank(request.getCode(), "code");

        var verificationRequest = new VerificationRequest(
                request.getLogin(),
                request.getCode()
        );

        AuthenticationResponse finalResponse = authService.verifyCode(verificationRequest);
        AuthServiceProto.AuthenticateResponse grpcResponse = AuthServiceProto.AuthenticateResponse.newBuilder()
                .setToken(finalResponse.getToken())
                .build();

        responseObserver.onNext(grpcResponse);
        responseObserver.onCompleted();
    }

    @Override
    public void validateJwtToken(
            AuthServiceProto.ValidateTokenRequest request,
            StreamObserver<AuthServiceProto.ValidateTokenResponse> responseObserver
    ) {
        requireNonBlank(request.getToken(), "token");
        boolean isValid = authService.validateToken(request.getToken());
        AuthServiceProto.ValidateTokenResponse response = AuthServiceProto.ValidateTokenResponse
                .newBuilder()
                .setIsValid(isValid)
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateLogin(
            AuthServiceProto.UpdateLoginRequest request,
            StreamObserver<AuthServiceProto.UpdateCredResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getLogin(), "login");
        credentialsService.updateLogin(userId, request.getLogin());
        AuthServiceProto.UpdateCredResponse response = AuthServiceProto.UpdateCredResponse
                .newBuilder()
                .setMessage("Login updated success")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateEmail(
            AuthServiceProto.UpdateEmailRequest request,
            StreamObserver<AuthServiceProto.UpdateCredResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getEmail(), "email");
        credentialsService.updateEmail(userId, request.getEmail());
        AuthServiceProto.UpdateCredResponse response = AuthServiceProto.UpdateCredResponse
                .newBuilder()
                .setMessage("Email updated success")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updatePassword(
            AuthServiceProto.UpdatePasswordRequest request,
            StreamObserver<AuthServiceProto.UpdateCredResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getOldPassword(), "old_password");
        requireNonBlank(request.getNewPassword(), "new_password");
        credentialsService.updatePassword(
                userId,
                request.getOldPassword(),
                request.getNewPassword());
        AuthServiceProto.UpdateCredResponse response = AuthServiceProto.UpdateCredResponse
                .newBuilder()
                .setMessage("Password changed success")
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void initiateEmailVerification(
            AuthServiceProto.UserIdRequest request,
            StreamObserver<AuthServiceProto.VerifyEmailResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        var userEntity = credentialsService.getByUserId(userId);

        if (userEntity.isEmailVerified()) {
            throw new EmailAlreadyVerifiedException("Email is already verified");
        }

        otpService.initiateEmailVerification(userEntity.getEmail());
        AuthServiceProto.VerifyEmailResponse responseGrpc = AuthServiceProto.VerifyEmailResponse
                .newBuilder()
                .setResult(true)
                .build();
        responseObserver.onNext(responseGrpc);
        responseObserver.onCompleted();
    }

    @Override
    public void finishEmailVerification(
            AuthServiceProto.VerifyEmailRequest request,
            StreamObserver<AuthServiceProto.VerifyEmailResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        requireNonBlank(request.getCode(), "code");
        var userEntity = credentialsService.getByUserId(userId);
        boolean result = otpService.validateOtp(userEntity.getEmail(), request.getCode());

        if (result) {
            credentialsService.verifyEmail(userId);
        }

        AuthServiceProto.VerifyEmailResponse responseGrpc = AuthServiceProto.VerifyEmailResponse
                .newBuilder()
                .setResult(result)
                .build();
        responseObserver.onNext(responseGrpc);
        responseObserver.onCompleted();
    }

    @Override
    public void getUserCredentials(
            AuthServiceProto.UserIdRequest request,
            StreamObserver<AuthServiceProto.UserCredResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        var userEntity = credentialsService.getByUserId(userId);

        AuthServiceProto.UserCredResponse responseGrpc = AuthServiceProto.UserCredResponse
                .newBuilder()
                .setLogin(userEntity.getLogin())
                .setEmail(userEntity.getEmail())
                .setEmailVerified(userEntity.isEmailVerified())
                .setEnabled(userEntity.isEnabled())
                .setCreatedAt(userEntity.getCreatedAt().toString())
                .build();
        responseObserver.onNext(responseGrpc);
        responseObserver.onCompleted();
    }

    @Override
    public void enableTwoFactor(
            AuthServiceProto.UserIdRequest request,
            StreamObserver<AuthServiceProto.EnableTwoFactorResponse> responseObserver
    ) {
        UUID userId = parseUuid(request.getUserId());
        try {
            twoFactorAuthService.enable2FA(userId);
            var response = AuthServiceProto.EnableTwoFactorResponse.newBuilder()
                    .setResult(true)
                    .setMessage("Two-factor authentication enabled")
                    .build();
            responseObserver.onNext(response);
        } catch (Exception ex) {
            var response = AuthServiceProto.EnableTwoFactorResponse.newBuilder()
                    .setResult(false)
                    .setMessage(ex.getMessage() == null ? "Failed to enable 2FA" : ex.getMessage())
                    .build();
            responseObserver.onNext(response);
        }
        responseObserver.onCompleted();
    }

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
}
