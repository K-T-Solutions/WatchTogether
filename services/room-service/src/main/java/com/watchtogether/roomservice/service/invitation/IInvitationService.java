package com.watchtogether.roomservice.service.invitation;


import com.watchtogether.grpc.GenerateInvitationRequest;
import com.watchtogether.grpc.JoinRoomByInviteRequest;
import com.watchtogether.grpc.JoinToRoomResponse;
import com.watchtogether.roomservice.entity.InvitationEntity;

import java.util.UUID;

public interface IInvitationService {


    InvitationEntity findByCode(String code);

    String generateInvitation(GenerateInvitationRequest request);

    JoinToRoomResponse.Builder joinRoomByInvite(JoinRoomByInviteRequest grpcRequest);
}
