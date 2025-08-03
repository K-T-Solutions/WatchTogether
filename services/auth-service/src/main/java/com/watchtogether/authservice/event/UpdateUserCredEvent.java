package com.watchtogether.authservice.event;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Builder
@Getter
@Setter
public class UpdateUserCredEvent {
    private UUID userId;
    private String newLogin; //TODO: подумать как назвать
//    private String credType;
}
