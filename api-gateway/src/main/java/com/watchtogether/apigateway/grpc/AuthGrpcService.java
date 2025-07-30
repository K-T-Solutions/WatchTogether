package com.watchtogether.apigateway.grpc;

import com.watchtogether.grpc.AuthServiceGrpc;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Service;


@Service
public class AuthGrpcService {

    @GrpcClient("authGrpcService")
    private AuthServiceGrpc.AuthServiceBlockingStub blockingStub;



}
