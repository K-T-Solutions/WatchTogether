package com.watchtogether.authservice.request;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class UpdatePasswordRequest {
    private UUID userId;
    private String oldPassword;
    private String newPassword;
}
