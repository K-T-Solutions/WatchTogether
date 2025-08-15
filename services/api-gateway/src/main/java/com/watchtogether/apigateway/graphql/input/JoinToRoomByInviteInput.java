package com.watchtogether.apigateway.graphql.input;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class JoinToRoomByInviteInput {
    private String inviteCode;
    private AddParticipantUnput participantInfo;
}
