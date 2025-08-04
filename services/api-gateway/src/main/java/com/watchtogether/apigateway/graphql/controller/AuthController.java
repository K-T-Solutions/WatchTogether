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
        AuthServiceProto.RegisterResponse response = authGrpcClient.registerUser(login, email, password);
        return new RegisterResponse(response.getSuccess(), response.getMessage());
    }

    @MutationMapping
    public LoginResponse login(
            @Argument String username,
            @Argument String password
    ) {
        AuthServiceProto.AuthenticateResponse response = authGrpcClient.authenticate(username, password);
        return new LoginResponse(response.getToken());
    }

    @QueryMapping
    public boolean validateToken(@Argument String token) {
        AuthServiceProto.ValidateTokenResponse response = authGrpcClient.validateToken(token);
        return response.getIsValid();
    }

    @MutationMapping
    public UpdateUserCredResponse updateUserLogin(@Argument UUID userId, @Argument String newLogin) {
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

    public record RegisterResponse(Boolean result, String message) {}

    public record LoginResponse(String token) {}

    public record UpdateUserCredResponse(String message) {}

}
