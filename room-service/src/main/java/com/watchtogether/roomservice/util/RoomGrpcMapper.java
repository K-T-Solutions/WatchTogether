package com.watchtogether.roomservice.util;
import com.watchtogether.grpc.*;
import com.watchtogether.roomservice.entity.RoomEntity;
import com.watchtogether.roomservice.enums.RoomCategory;
import com.watchtogether.roomservice.enums.RoomType;
import com.watchtogether.roomservice.request.CreateRoomRequest;
import com.watchtogether.roomservice.request.UpdateRoomRequest;

public class RoomGrpcMapper {

    public static RoomTypeGrpc toRoomTypeGrpc(RoomType entityType) {
        if (entityType == null) return null;

        return switch (entityType) {
            case PUBLIC -> RoomTypeGrpc.PUBLIC;
            case PRIVATE -> RoomTypeGrpc.PRIVATE;
        };
    }

    public static RoomType fromRoomTypeGrpc(RoomTypeGrpc grpcType) {
        if (grpcType == null) return null;

        return switch (grpcType) {
            case PUBLIC -> RoomType.PUBLIC;
            case PRIVATE -> RoomType.PRIVATE;
            case UNRECOGNIZED -> throw new IllegalArgumentException("Unrecognized room type");
        };
    }

    public static RoomCategoryGrpc toRoomCategoryGrpc(RoomCategory entityCategory) {
        if (entityCategory == null) return null;

        return switch (entityCategory) {
            case MOVIES -> RoomCategoryGrpc.SERIES;
            case ANIME -> RoomCategoryGrpc.ANIME;
            case MUSIC -> RoomCategoryGrpc.MUSIC;
            case GAMING -> RoomCategoryGrpc.GAMING;
            case EDUCATION -> RoomCategoryGrpc.EDUCATION;
            case SPORTS -> RoomCategoryGrpc.SPORTS;
            case STAND_UP -> RoomCategoryGrpc.STAND_UP;
            case KIDS -> RoomCategoryGrpc.KIDS;
            case ART -> RoomCategoryGrpc.ART;
            case TRAVEL -> RoomCategoryGrpc.TRAVEL;
            case COOKING -> RoomCategoryGrpc.COOKING;
            case FASHION -> RoomCategoryGrpc.FASHION;
            case LIVE -> RoomCategoryGrpc.LIVE;
            case TESTING -> RoomCategoryGrpc.TESTING;
            case SOCIAL -> RoomCategoryGrpc.SOCIAL;
            case OTHER -> RoomCategoryGrpc.OTHER;
            case NONE -> RoomCategoryGrpc.NONE;
            default -> throw new IllegalArgumentException("Unrecognized room category");
        };
    }

    public static RoomCategory fromRoomCategoryGrpc(RoomCategoryGrpc grpcCategory) {
        if (grpcCategory == null) return null;

        return switch (grpcCategory) {
            case MOVIES -> RoomCategory.MOVIES;
            case ANIME -> RoomCategory.ANIME;
            case MUSIC -> RoomCategory.MUSIC;
            case GAMING -> RoomCategory.GAMING;
            case EDUCATION -> RoomCategory.EDUCATION;
            case SPORTS -> RoomCategory.SPORTS;
            case STAND_UP -> RoomCategory.STAND_UP;
            case KIDS -> RoomCategory.KIDS;
            case ART -> RoomCategory.ART;
            case TRAVEL -> RoomCategory.TRAVEL;
            case COOKING -> RoomCategory.COOKING;
            case FASHION -> RoomCategory.FASHION;
            case LIVE -> RoomCategory.LIVE;
            case TESTING -> RoomCategory.TESTING;
            case SOCIAL -> RoomCategory.SOCIAL;
            case OTHER -> RoomCategory.OTHER;
            case NONE -> RoomCategory.NONE;
            default -> throw new IllegalArgumentException("Unrecognized room category");
        };
    }

    public static RoomResponseGrpc toRoomResponseGrpc(RoomEntity entity) {
        return  RoomResponseGrpc.newBuilder()
                .setRoom(toRoomGrpc(entity))
                .build();
    }

    public static RoomGrpc toRoomGrpc(RoomEntity entity) {
        return RoomGrpc.newBuilder()
                .setId(entity.getId().toString())
                .setName(entity.getName())
                .setDescription(entity.getDescription())
                .setType(RoomGrpcMapper.toRoomTypeGrpc(entity.getType()))
                .setCategory(RoomGrpcMapper.toRoomCategoryGrpc(entity.getCategory()))
                .setMaxParticipants(entity.getMaxParticipants())
                .setOwnerId(entity.getOwnerId().toString())
                .build();
    }

    public static CreateRoomRequest fromCreateRequestGrpc(CreateRoomRequestGrpc request) {
        return new CreateRoomRequest(
                request.getName(),
                request.getDescription(),
                fromRoomTypeGrpc(request.getType()),
                fromRoomCategoryGrpc(request.getCategory()),
                request.getPassword(),
                request.getMaxParticipants());
    }

    public static UpdateRoomRequest fromUpdateRequest(UpdateRoomRequestGrpc request) {
        return new UpdateRoomRequest(
                request.getName(),
                request.getDescription(),
                fromRoomTypeGrpc(request.getType()),
                fromRoomCategoryGrpc(request.getCategory()));
    }
}