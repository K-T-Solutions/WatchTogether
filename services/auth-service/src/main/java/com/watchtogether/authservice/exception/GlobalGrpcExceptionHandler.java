package com.watchtogether.authservice.exception;

import io.grpc.Status;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(LoginAlreadyTakenException.class)
    public Status handleLoginAlreadyTakenException(LoginAlreadyTakenException e) {
        return Status.ALREADY_EXISTS.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(UserNotFoundException.class)
    public Status handleUserNotFoundException(UserNotFoundException e) {
        return Status.NOT_FOUND.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(InvalidCredentialsException.class)
    public Status handleInvalidCredentialsException(InvalidCredentialsException e) {
        return Status.ABORTED.withDescription(e.getMessage()).withCause(e); //TODO: change status
    }

}
