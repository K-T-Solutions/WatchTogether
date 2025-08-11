package com.watchtogether.apigateway.graphql.input;

import com.watchtogether.apigateway.enums.GraphQLRoomCategory;
import com.watchtogether.apigateway.enums.GraphQLRoomType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateRoomRequest {
    private String ownerId;
    private String roomName;
    private String  roomDescription;
    private GraphQLRoomType roomType;
    private GraphQLRoomCategory roomCategory;
    private String roomPassword;
    private int maxParticipants;
}
