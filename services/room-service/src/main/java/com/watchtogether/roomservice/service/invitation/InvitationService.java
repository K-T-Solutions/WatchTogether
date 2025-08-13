package com.watchtogether.roomservice.service.invitation;

import com.watchtogether.grpc.GenerateInvitationRequest;
import com.watchtogether.grpc.JoinRoomByInviteRequest;
import com.watchtogether.grpc.JoinToRoomResponse;
import com.watchtogether.roomservice.entity.ActiveRoomEntity;
import com.watchtogether.roomservice.entity.InvitationEntity;
import com.watchtogether.roomservice.exception.InvalidInvitationException;
import com.watchtogether.roomservice.repository.InvitationRepository;
import com.watchtogether.roomservice.service.room.IRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;


@Slf4j
@RequiredArgsConstructor
@Service
public class InvitationService implements IInvitationService {

    private static final String INVITATION_TOKEN_CHARACTERS = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    private static final int INVITATION_TOKEN_LENGTH = 8;
    private static final SecureRandom random = new SecureRandom();

    private final InvitationRepository invitationRepository;
    private final IRoomService roomService;

    @Override
    public InvitationEntity findByCode(String code) {
        return invitationRepository.findById(code).orElseThrow(() ->
                new InvalidInvitationException("Token not found"));
    }

    @Override
    public String generateInvitation(GenerateInvitationRequest request) { //TODO: либо просто без java Duration делать
        var invitationEntity = new InvitationEntity
                (generateInvitationToken(),
                request.getRoomId(),
                request.getCreatorId(),
                java.time.Duration.ofSeconds(request.getDurationSecs().getSeconds()), //TODO: check
                request.getMaxUses());

        invitationRepository.save(invitationEntity);

        return invitationEntity.getCode();
    }

    @Override
    public JoinToRoomResponse.Builder joinRoomByInvite(JoinRoomByInviteRequest grpcRequest) {

        var invitationEntity = validateInvitation(grpcRequest.getInviteCode());

        return roomService.addParticipantToRoom(
                invitationEntity.getRoomId(),
                grpcRequest.getParticipant());
    }

    private InvitationEntity validateInvitation(String code) { // если не бросается исключение - все ок
        var invitationEntity = findByCode(code);

        if (!invitationEntity.canBeUsed()) {
            throw new InvalidInvitationException("Invitation cannot be used: expired or max uses reached");
        }

        invitationEntity.use();
        return invitationRepository.save(invitationEntity);
    }

    private String generateInvitationToken() {
        StringBuilder code = new StringBuilder(INVITATION_TOKEN_LENGTH);
        for (int i = 0; i < INVITATION_TOKEN_LENGTH; i++) {
            code.append(INVITATION_TOKEN_CHARACTERS.charAt(random.nextInt(INVITATION_TOKEN_CHARACTERS.length())));
        }
        return code.toString();
    }


}
