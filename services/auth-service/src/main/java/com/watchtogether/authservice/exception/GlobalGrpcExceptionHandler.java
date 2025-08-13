package com.watchtogether.authservice.exception;

import io.grpc.Status;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(LoginAlreadyTakenException.class)
    public Status handleLoginAlreadyTakenException(LoginAlreadyTakenException e) {
        return Status.ALREADY_EXISTS.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(EmailAlreadyTakenException.class)
    public Status handleEmailAlreadyTakenException(EmailAlreadyTakenException e) {
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

    @GrpcExceptionHandler(IllegalArgumentException.class)
    public Status handleIllegalArgumentException(IllegalArgumentException e) {
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(BadCredentialsException.class)
    public Status handleBadCredentials(BadCredentialsException e) {
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(UsernameNotFoundException.class)
    public Status handleUsernameNotFound(UsernameNotFoundException e) {
        return Status.NOT_FOUND.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(EmailAlreadyVerifiedException.class)
    public Status handleEmailAlreadyVerified(EmailAlreadyVerifiedException e) {
        return Status.FAILED_PRECONDITION.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(Exception.class)
    public Status handleGeneric(Exception e) {
        return Status.INTERNAL.withDescription("Internal error").withCause(e);
    }

}
