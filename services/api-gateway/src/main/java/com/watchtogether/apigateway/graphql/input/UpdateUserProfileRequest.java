package com.watchtogether.apigateway.graphql.input;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserProfileRequest {
    private String userId;
    private String displayName;
    private String displayEmail;
    private String bio;
}
