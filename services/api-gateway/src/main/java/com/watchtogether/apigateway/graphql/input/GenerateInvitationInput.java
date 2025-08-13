package com.watchtogether.apigateway.graphql.input;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class GenerateInvitationInput {
    private UUID roomId;
    private UUID creatorId;
    private int durationSecs;
    private int maxUses;
}
