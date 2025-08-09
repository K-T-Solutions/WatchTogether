package com.watchtogether.apigateway.graphql.controller;

import com.watchtogether.apigateway.grpc.AuthGrpcClient;
import com.watchtogether.grpc.AuthServiceProto;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.UUID;

@Controller
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthGrpcClient authGrpcClient;

    @MutationMapping
    public RegisterResponse register(
            @Argument String login,
            @Argument String email,
            @Argument String password
    ) {
        AuthServiceProto.RegisterResponse responseGrpc = authGrpcClient.registerUser(login, email, password);
        return new RegisterResponse(responseGrpc.getSuccess(), responseGrpc.getMessage());
    }

    @MutationMapping
    public AuthenticationResponse login(
            @Argument String username,
            @Argument String password
    ) {
        AuthServiceProto.AuthenticateResponse responseGrpc = authGrpcClient.login(username, password);

        if (responseGrpc.getResponseTypeCase() ==
                AuthServiceProto.AuthenticateResponse.ResponseTypeCase.TWO_FACTOR_REQUIRED) {
            return new AuthenticationResponse(true, null);
        } else {
            return new AuthenticationResponse(false, responseGrpc.getToken());
        }
    }

    @QueryMapping
    public AuthenticationResponse validateOtp(
            @Argument String login,
            @Argument String code
    ) {
        AuthServiceProto.AuthenticateResponse responseGrpc = authGrpcClient.validateOtp(login, code);
        return new AuthenticationResponse(true, responseGrpc.getToken());
    }

    @QueryMapping
    public boolean validateJwtToken(@Argument String token) {
        AuthServiceProto.ValidateTokenResponse responseGrpc = authGrpcClient.validateToken(token);
        return responseGrpc.getIsValid();
    }

    @MutationMapping
    public UpdateUserCredResponse updateUserLogin(@Argument UUID userId, @Argument String newLogin) { //TODO: наверное не так надо обрабатывать
        try {
            var response = authGrpcClient.updateUserLogin(userId.toString(), newLogin);
            return new UpdateUserCredResponse(response.getMessage());
        } catch (Exception e) {
            // Обрабатываем gRPC ошибки
            String errorMessage = e.getMessage();
            if (errorMessage.contains("ALREADY_EXISTS")) {
                return new UpdateUserCredResponse("This login is already taken");
            } else if (errorMessage.contains("NOT_FOUND")) {
                return new UpdateUserCredResponse("User not found");
            } else if (errorMessage.contains("ABORTED")) {
                return new UpdateUserCredResponse("Invalid credentials");
            } else {
                return new UpdateUserCredResponse("Error updating login: " + errorMessage);
            }
        }
    }

    @MutationMapping
    public UpdateUserCredResponse updateUserEmail(@Argument UUID userId, @Argument String newLogin) { //TODO: refactor
        try {
            var response = authGrpcClient.updateUserEmail(userId.toString(), newLogin);
            return new UpdateUserCredResponse(response.getMessage());
        } catch (Exception e) {
            // Обрабатываем gRPC ошибки
            String errorMessage = e.getMessage();
            if (errorMessage.contains("ALREADY_EXISTS")) {
                return new UpdateUserCredResponse("This email is already taken");
            } else if (errorMessage.contains("NOT_FOUND")) {
                return new UpdateUserCredResponse("User not found");
            } else if (errorMessage.contains("ABORTED")) {
                return new UpdateUserCredResponse("Invalid credentials");
            } else {
                return new UpdateUserCredResponse("Error updating email: " + errorMessage);
            }
        }
    }

    @MutationMapping
    public UpdateUserCredResponse updateUserPassword(@Argument UUID userId, @Argument String oldPass, @Argument String newPass) {
        try {
            var response = authGrpcClient.updateUserPassword(userId.toString(), oldPass, newPass);
            return new UpdateUserCredResponse(response.getMessage());
        } catch (Exception e) {
            // Обрабатываем gRPC ошибки
            String errorMessage = e.getMessage();
            if (errorMessage.contains("NOT_FOUND")) {
                return new UpdateUserCredResponse("User not found");
            } else if (errorMessage.contains("ABORTED")) {
                return new UpdateUserCredResponse("Invalid current password");
            } else {
                return new UpdateUserCredResponse("Error updating password: " + errorMessage);
            }
        }
    }

    @QueryMapping
    public Boolean initiateEmailVerification(@Argument UUID userId) {
        return authGrpcClient.initiateEmailVerification(userId.toString()).getResult(); //TODO: refactor
    }

    @QueryMapping
    public Boolean finishEmailVerification(@Argument UUID userId, @Argument String code) {
        return authGrpcClient.finishEmailVerification(userId.toString(), code).getResult(); //TODO: refactor
    }

    @QueryMapping
    public AuthServiceProto.UserCredResponse getUserCredentials(@Argument UUID userId) {
        return authGrpcClient.getUserCred(userId.toString());
    }

    @MutationMapping
    public UpdateUserCredResponse enableTwoFactor(@Argument UUID userId) {
        try {
            var response = authGrpcClient.enableTwoFactor(userId.toString());
            if (response.getResult()) {
                return new UpdateUserCredResponse(response.getMessage());
            }
            return new UpdateUserCredResponse("Error enabling 2FA: " + response.getMessage());
        } catch (Exception e) {
            return new UpdateUserCredResponse("Error enabling 2FA: " + e.getMessage());
        }
    }

    public record RegisterResponse(Boolean result, String message) {}

    public record AuthenticationResponse(boolean twoFactorRequired, String token) {}

    public record UpdateUserCredResponse(String message) {}

//    public record UserCredResponse(String login,
//                                   String email,
//                                   boolean emailVerified,
//                                   boolean enabled,
//                                   String createdAt) {}

}
