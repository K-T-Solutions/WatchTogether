package com.watchtogether.roomservice.request;

import com.watchtogether.roomservice.enums.RoomCategory;
import com.watchtogether.roomservice.enums.RoomType;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateRoomRequest {
    private String name;
    private String description;
    private RoomType type;
    private RoomCategory category;
    private String password;
    private int maxParticipant;
}
