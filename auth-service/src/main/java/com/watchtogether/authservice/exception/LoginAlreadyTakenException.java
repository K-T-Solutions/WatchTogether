package com.watchtogether.authservice.exception;

public class LoginAlreadyTakenException extends RuntimeException {
    public LoginAlreadyTakenException(String message) {
        super(message);
    }
}
