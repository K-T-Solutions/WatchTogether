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
        AuthServiceProto.RegisterResponseGrpc response = authGrpcClient.registerUser(login, email, password);
        return new RegisterResponse(response.getSuccess(), response.getMessage());
    }

//    @MutationMapping
//    public LoginResponse login(
//            @Argument String username,
//            @Argument String password
//    ) {
//        AuthServiceProto.AuthenticateResponseGrpc response = authGrpcClient.login(username, password);
//        return new LoginResponse(response.getToken());
//    }

    @MutationMapping
    public AuthenticationResponse login(
            @Argument String username,
            @Argument String password
    ) {
        // 1. Вызываем gRPC клиент, как и раньше
        AuthServiceProto.AuthenticateResponseGrpc response = authGrpcClient.login(username, password);

        // 2. Анализируем ответ от gRPC сервиса
        // Используем getResponseTypeCase(), чтобы проверить, какое поле в 'oneof' заполнено
        if (response.getResponseTypeCase() == AuthServiceProto.AuthenticateResponseGrpc.ResponseTypeCase.TWO_FACTOR_REQUIRED) {
            // Требуется второй шаг. Возвращаем соответствующий ответ.
            // Токена нет, флаг twoFactorRequired = true
            return new AuthenticationResponse(true, null);
        } else {
            // 2FA не требуется, аутентификация прошла успешно.
            // Возвращаем токен, флаг twoFactorRequired = false
            return new AuthenticationResponse(false, response.getToken());
        }
    }

    @MutationMapping
    public AuthenticationResponse validateOtp(
            @Argument String email,
            @Argument String code
    ) {
        AuthServiceProto.AuthenticateResponseGrpc response = authGrpcClient.validateOtp(email, code);

        return new AuthenticationResponse(true, response.getToken());
    }

    @QueryMapping
    public boolean validateToken(@Argument String token) {
        AuthServiceProto.ValidateTokenResponseGrpc response = authGrpcClient.validateToken(token);
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

    @QueryMapping
    public Boolean sendEmailVerificationCode(@Argument UUID userId) {
        return authGrpcClient.sendEmailVerificationCode(userId.toString()).getResult(); //TODO: refactor
    }

    @QueryMapping
    public Boolean verifyEmailCode(@Argument UUID userId, @Argument String code) {
        return authGrpcClient.verifyEmailCode(userId.toString(), code).getResult(); //TODO: refactor
    }

    public record RegisterResponse(Boolean result, String message) {}

    public record AuthenticationResponse(boolean twoFactorRequired, String token) {}

    public record UpdateUserCredResponse(String message) {}

}
