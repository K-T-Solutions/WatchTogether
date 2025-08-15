package com.watchtogether.roomservice.service.invitation;

import com.watchtogether.grpc.*;
import com.watchtogether.roomservice.entity.InvitationEntity;
import com.watchtogether.roomservice.exception.InvalidInvitationException;
import com.watchtogether.roomservice.repository.InvitationRepository;
import com.watchtogether.roomservice.service.room.IRoomService;
import com.watchtogether.roomservice.util.RoomMapper;
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
    private final RoomMapper roomMapper;

    @Override
    public InvitationEntity findByCode(String code) {
        return invitationRepository.findById(code).orElseThrow(() ->
                new InvalidInvitationException("Token not found"));
    }

    @Override
    public String generateInvitation(GenerateInvitationRequest request) {
        var invitationEntity = new InvitationEntity
                (generateInvitationToken(),
                request.getRoomId(),
                request.getCreatorId(),
                java.time.Duration.ofSeconds(request.getDurationSecs().getSeconds()),
                request.getMaxUses());

        invitationRepository.save(invitationEntity);

        return invitationEntity.getCode();
    }

    public ValidateInvitationResponse validateInvitationCode(String code, String userId) {
        var invitationEntity = findByCode(code);

        if (!invitationEntity.canBeUsed()) {
            throw new InvalidInvitationException("Invitation cannot be used: expired or max uses reached");
        }

        var roomEntity = roomService.findRoomById(invitationEntity.getRoomId());


        //TODO: добавить проверки(не забанен ли и т.д.)

        return ValidateInvitationResponse.newBuilder()
                .setSuccess(true)
                .setMessage("Invitation successfully validated")
                .setRoom(roomMapper.mapRoomToGrpc(roomEntity))
                .build();
    }

    public JoinToRoomResponse.Builder joinToRoomByInvitation(JoinToRoomByInviteRequest request) {

        var invitation = findByCode(request.getInviteCode());

        if (!invitation.canBeUsed()) {
            throw new InvalidInvitationException("Invitation cannot be used: expired or max uses reached"); //TODO: перенести из сервиса
        }

        invitation.use();

        var room = roomService.addParticipantToRoom(request.getRequest());

        invitationRepository.save(invitation);

        return roomMapper.mapJoinToRoomResponseToGrpc(room);
    }


    private String generateInvitationToken() {
        StringBuilder code = new StringBuilder(INVITATION_TOKEN_LENGTH);
        for (int i = 0; i < INVITATION_TOKEN_LENGTH; i++) {
            code.append(INVITATION_TOKEN_CHARACTERS.charAt(random.nextInt(INVITATION_TOKEN_CHARACTERS.length())));
        }
        return code.toString();
    }


}
