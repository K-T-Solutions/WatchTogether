package com.watchtogether.roomservice.exception;

import io.grpc.Status;
import net.devh.boot.grpc.server.advice.GrpcAdvice;
import net.devh.boot.grpc.server.advice.GrpcExceptionHandler;
import com.watchtogether.roomservice.exception.RoomNotFoundException;

@GrpcAdvice
public class GlobalGrpcExceptionHandler {

    @GrpcExceptionHandler(RoomNotFoundException.class)
    public Status handleRoomNotFoundException(RoomNotFoundException e) {
        // Преобразуем наше исключение в стандартный gRPC статус
        return Status.NOT_FOUND.withDescription(e.getMessage()).withCause(e);
    }

    @GrpcExceptionHandler(IllegalArgumentException.class)
    public Status handleIllegalArgumentException(IllegalArgumentException e) {
        return Status.INVALID_ARGUMENT.withDescription(e.getMessage()).withCause(e);
    }

    // Можно добавить обработчики для других исключений (например, пермишенов - PERMISSION_DENIED)
}
