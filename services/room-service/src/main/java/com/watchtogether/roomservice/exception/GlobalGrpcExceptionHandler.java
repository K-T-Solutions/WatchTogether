package com.watchtogether.roomservice.exception;

import io.grpc.Status;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;

@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(InvalidInvitationException.class)
    public Status handleInvalidTokenException(InvalidInvitationException e) {
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).withCause(e);
    } //TODO: почему то искл. не обрабатывается

    @GrpcExceptionHandler(NotRoomMemberException.class)
    public Status handleNotRoomMemberException(NotRoomMemberException e) {
        return Status.PERMISSION_DENIED.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(PermissionDeniedException.class)
    public Status handlePermissionDeniedException(PermissionDeniedException e) {
        return Status.PERMISSION_DENIED.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(ResourceNotFoundException.class)
    public Status handleResourceNotFoundException(ResourceNotFoundException e) {
        return Status.NOT_FOUND.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(RoomNotFoundException.class)
    public Status handleRoomNotFoundException(RoomNotFoundException e) {
        return Status.NOT_FOUND.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(IllegalArgumentException.class)
    public Status handleIllegalArgumentException(IllegalArgumentException e) {
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).withCause(e);
    }




}
