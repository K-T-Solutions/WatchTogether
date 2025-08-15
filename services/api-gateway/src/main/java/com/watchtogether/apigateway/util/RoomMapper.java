package com.watchtogether.apigateway.util;

import com.watchtogether.apigateway.enums.GraphQLRoomCategory;
import com.watchtogether.apigateway.enums.GraphQLRoomType;
import com.watchtogether.apigateway.graphql.controller.RoomController;
import com.watchtogether.grpc.RoomCategory;
import com.watchtogether.grpc.RoomParticipant;
import com.watchtogether.grpc.RoomResponse;
import com.watchtogether.grpc.RoomType;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    public GraphQLRoomCategory mapCategoryToGraphQL(RoomCategory grpcCategory) {
        if (grpcCategory == null) {
            return GraphQLRoomCategory.NONE;
        }

        return switch (grpcCategory) {
            case MOVIES -> GraphQLRoomCategory.MOVIES;
            case SERIES -> GraphQLRoomCategory.SERIES;
            case ANIME -> GraphQLRoomCategory.ANIME;
            case MUSIC -> GraphQLRoomCategory.MUSIC;
            case GAMING -> GraphQLRoomCategory.GAMING;
            case EDUCATION -> GraphQLRoomCategory.EDUCATION;
            case SPORTS -> GraphQLRoomCategory.SPORTS;
            case STAND_UP -> GraphQLRoomCategory.STAND_UP;
            case KIDS -> GraphQLRoomCategory.KIDS;
            case ART -> GraphQLRoomCategory.ART;
            case TRAVEL -> GraphQLRoomCategory.TRAVEL;
            case COOKING -> GraphQLRoomCategory.COOKING;
            case FASHION -> GraphQLRoomCategory.FASHION;
            case LIVE -> GraphQLRoomCategory.LIVE;
            case TESTING -> GraphQLRoomCategory.TESTING;
            case SOCIAL -> GraphQLRoomCategory.SOCIAL;
            case OTHER -> GraphQLRoomCategory.OTHER;
            default -> GraphQLRoomCategory.NONE;
        };
    }

    public RoomCategory mapCategoryToGrpc(GraphQLRoomCategory graphqlCategory) {
        if (graphqlCategory == null) {
            return RoomCategory.NONE;
        }

        return switch (graphqlCategory) {
            case MOVIES -> RoomCategory.MOVIES;
            case SERIES -> RoomCategory.SERIES;
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
            default -> RoomCategory.NONE;
        };
    }

    public GraphQLRoomType mapTypeToGraphQL(RoomType grpcType) {
//        assert grpcType != null; //TODO: check
        return switch (grpcType) {
            case PRIVATE ->  GraphQLRoomType.PRIVATE;
            case PUBLIC ->  GraphQLRoomType.PUBLIC;
            case UNRECOGNIZED -> null;
        };
    }

    public RoomType mapTypeToGrpc(GraphQLRoomType graphqlType) {
//        assert graphqlType != null; //TODO: check
        return switch (graphqlType) {
            case PRIVATE ->  RoomType.PRIVATE;
            case PUBLIC ->  RoomType.PUBLIC;
        };
    }

    public RoomParticipant mapParticipantToGrpc(RoomParticipant grpcParticipant) {
        return RoomParticipant.newBuilder()
                .setUserId(grpcParticipant.getUserId())
                .setDisplayName(grpcParticipant.getDisplayName())
                .build();
    }

    public RoomController.RoomParticipant mapParticipantToGraphQL(RoomParticipant grpcParticipant) {
        return new RoomController.RoomParticipant(
                grpcParticipant.getUserId(),
                grpcParticipant.getDisplayName());
    }

    public RoomController.RoomResponse mapRoomToGraphQL(RoomResponse grpcResponse) {
        return new RoomController.RoomResponse(
                grpcResponse.getRoomId(),
                mapParticipantToGraphQL(grpcResponse.getRoomCreator()),
                grpcResponse.getRoomName(),
                grpcResponse.getRoomDescription(),
                mapTypeToGraphQL(grpcResponse.getRoomType()),
                mapCategoryToGraphQL(grpcResponse.getRoomCategory()),
                grpcResponse.getMaxParticipants(),
                grpcResponse.getNeedPassword(),
                grpcResponse.getParticipantNumber(),
                grpcResponse.getCreatedAt().toString());
    }

}
