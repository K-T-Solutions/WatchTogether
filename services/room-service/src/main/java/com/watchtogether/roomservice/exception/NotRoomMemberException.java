package com.watchtogether.roomservice.exception;

public class NotRoomMemberException extends RuntimeException {
    public NotRoomMemberException(String message) {
        super(message);
    }
}
