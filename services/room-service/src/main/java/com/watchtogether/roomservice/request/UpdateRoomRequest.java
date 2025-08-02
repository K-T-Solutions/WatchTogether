package com.watchtogether.roomservice.request;

import com.watchtogether.roomservice.enums.RoomCategory;
import com.watchtogether.roomservice.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateRoomRequest {
    private String roomName;
    private String description;
    private RoomType roomType;
    private RoomCategory roomCategory;
}
