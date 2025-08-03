package com.watchtogether.userprofileservice.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisterEvent {
    private UUID userId;
    private String login;
    private String email;
}
