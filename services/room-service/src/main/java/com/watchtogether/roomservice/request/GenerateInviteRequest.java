package com.watchtogether.roomservice.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Duration;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GenerateInviteRequest {
    private UUID roomId;
    private UUID creatorId;
    private Duration duration;
    private int maxUses;
}
