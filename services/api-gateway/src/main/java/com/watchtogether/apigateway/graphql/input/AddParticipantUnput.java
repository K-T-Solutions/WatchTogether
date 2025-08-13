package com.watchtogether.apigateway.graphql.input;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AddParticipantUnput {
    private UUID roomId;
    private UUID participantId;
    private String participantDisplayName;
    private String password;
}
