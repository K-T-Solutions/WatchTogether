package com.watchtogether.roomservice.util;

import com.google.protobuf.Timestamp;
import com.watchtogether.grpc.JoinToRoomResponse;
import com.watchtogether.grpc.RoomParticipant;
import com.watchtogether.grpc.RoomResponse;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    public RoomResponse mapRoomToGrpc(ActiveRoomEntity roomEntity) {
        return RoomResponse.newBuilder()
                .setRoomId(roomEntity.getId())
                .setRoomCreator(RoomParticipant.newBuilder()
                        .setUserId(roomEntity.getOwnerId())
                        .setDisplayName(roomEntity.getParticipant(roomEntity.getOwnerId()).getDisplayName()) //TODO: improve
                        .build())
                .setRoomName(roomEntity.getName())
                .setRoomDescription(roomEntity.getDescription())
                .setRoomType(roomEntity.getType())
                .setRoomCategory(roomEntity.getCategory())
                .setMaxParticipants(roomEntity.getMaxParticipants())
                .setNeedPassword(!roomEntity.getPasswordHash().isEmpty())
                .setParticipantNumber(roomEntity.getParticipants().size())
                .setCreatedAt(Timestamp.newBuilder()
                        .setSeconds(roomEntity.getCreatedAt().getEpochSecond())
                        .setNanos(roomEntity.getCreatedAt().getNano())
                        .build())
                .build();
    }

    public JoinToRoomResponse.Builder mapJoinToRoomResponseToGrpc(ActiveRoomEntity room) {
        return JoinToRoomResponse.newBuilder()
                .setSuccess(true)
                .setRoomId(room.getId())
                .setRoomName(room.getName())
                .setRoomDescription(room.getDescription())
                .setRoomType(room.getType())
                .setRoomCategory(room.getCategory())
                .setMaxParticipants(room.getMaxParticipants())
                .setParticipantNumber(room.getParticipants().size())
                .setCreatedAt(Timestamp.newBuilder()
                        .setSeconds(room.getCreatedAt().getEpochSecond())
                        .setNanos(room.getCreatedAt().getNano())
                        .build())
                .addAllRoomParticipants(room.getParticipants().stream()
                        .map(participant -> RoomParticipant.newBuilder()
                                .setUserId(participant.getUserId())
                                .setDisplayName(participant.getDisplayName())
                                .build()).toList());
    }


}
