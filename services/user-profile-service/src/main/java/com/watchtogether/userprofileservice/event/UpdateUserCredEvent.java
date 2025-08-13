package com.watchtogether.userprofileservice.event;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserCredEvent {
    private UUID userId;
    private String newLogin;
    private String credType;
}

