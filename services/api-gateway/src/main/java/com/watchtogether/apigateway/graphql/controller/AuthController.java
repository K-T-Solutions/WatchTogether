package com.watchtogether.apigateway.graphql.controller;

import com.watchtogether.apigateway.grpc.AuthGrpcClient;
import com.watchtogether.grpc.AuthServiceProto;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

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

    public record RegisterResponse(Boolean result, String message) {}

    public record LoginResponse(String token) {}

}
