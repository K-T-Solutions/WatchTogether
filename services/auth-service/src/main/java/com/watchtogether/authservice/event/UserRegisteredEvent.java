package com.watchtogether.authservice.event;

import lombok.*;

import java.util.UUID;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisteredEvent {
    private UUID userId;
    private String login;
    private String email;
}
