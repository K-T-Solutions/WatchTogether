//package com.watchtogether.roomservice.service.invitation;
//
//import com.watchtogether.roomservice.entity.InvitationEntity;
//import com.watchtogether.roomservice.entity.RoomEntity;
//import com.watchtogether.roomservice.entity.RoomParticipantEntity;
//import com.watchtogether.roomservice.enums.ParticipantRole;
//import com.watchtogether.roomservice.exception.InvalidTokenException;
//import com.watchtogether.roomservice.exception.PermissionDeniedException;
//import com.watchtogether.roomservice.exception.ResourceNotFoundException;
//import com.watchtogether.roomservice.repository.InvitationRepository;
//import com.watchtogether.roomservice.request.GenerateInviteRequest;
//import com.watchtogether.roomservice.service.participant.IRoomParticipantService;
//import com.watchtogether.roomservice.service.room.IRoomService;
//import com.watchtogether.roomservice.util.InvitationTokenGenerator;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//
//import java.time.Instant;
//import java.util.Optional;
//import java.util.UUID;
//
//@Slf4j
//@RequiredArgsConstructor
//@Service
//public class InvitationService implements IInvitationService {
//    private final IRoomService roomService;
//    private final IRoomParticipantService roomParticipantService;
//    private final InvitationRepository invitationRepository;
//    private final InvitationTokenGenerator tokenGenerator;
//
//    @Override
//    public InvitationEntity generateInvitation(GenerateInviteRequest request) {
//        RoomEntity room = roomService.getRoomById(request.getRoomId()); //TODO: сделать проверку вообще тот кто состоит в той ли комнате
//
//        RoomParticipantEntity invitationCreator = roomParticipantService
//                .getByRoomIdAndUserId(request.getRoomId(), request.getCreatorId()); //TODO: как то исключения обрабатывать
//
//
//        if (!hasPermission(request.getRoomId(), request.getCreatorId())) {
//            throw new PermissionDeniedException("You don't have permission to generate invite");
//        }
//
//        InvitationEntity invitation = new InvitationEntity();
//        invitation.setRoomId(request.getRoomId());
//        invitation.setCreatedBy(request.getCreatorId());
//        invitation.setToken(tokenGenerator.generateSecureToken());
//        invitation.setExpiresAt(Instant.now().plus(request.getDuration()));
//        invitation.setMaxUses(request.getMaxUses());
//
//        return invitationRepository.save(invitation);
//    }
//
//    @Override
//    public boolean validateInvitation(UUID roomId, String token) { //TODO: надо еще хешировать токен наверное
//
//        InvitationEntity invitation = invitationRepository.findByRoomId(roomId)
//                .orElseThrow(() ->
//                        new ResourceNotFoundException("Invitation for room " + roomId + " not found"));
//
//        if (!invitation.getToken().equals(token)) {
//            throw new InvalidTokenException("Invalid token");
//        } else if (invitation.getExpiresAt().isBefore(Instant.now())) {
//            throw new InvalidTokenException("Expired token");
//        } else if (invitation.getMaxUses() <= invitation.getUseCount()) {
//            throw new InvalidTokenException("Max uses exceeded");
//        }
//        return true; //TODO: refactor
////
////
//////
//////        Optional<InvitationEntity> invitation = invitationRepository
//////                .findByRoomIdAndToken(roomId, token);
////
////        return  invitation.getExpiresAt().isAfter(Instant.now()) &&
////                (invitation.get().getMaxUses() > invitation.get().getUseCount());
//    }
//
//    public boolean hasPermission(UUID roomId, UUID userId) {
//        RoomEntity room = roomService.getRoomById(roomId);
//        RoomParticipantEntity roomParticipant = roomParticipantService.getByRoomIdAndUserId(roomId, userId);
//        ParticipantRole role = roomParticipant.getRole();
//
//        return switch (room.getSettings().getInvitationPermission()) {
//            case OWNER_ONLY -> role == ParticipantRole.OWNER;
//            case MODERATORS -> role == ParticipantRole.OWNER || role == ParticipantRole.MODERATOR;
//            case VIP_MEMBERS -> role == ParticipantRole.OWNER || role == ParticipantRole.MODERATOR ||
//                    role == ParticipantRole.VIP;
//            case ALL_MEMBERS -> true;
//            case DISABLED -> false;
//        };
//    }
//
//    @Scheduled(fixedRate = 5 * 60 * 1000)
//    public void cleanupExpiredInvitations() {
//        log.info("Cleaning up expired invitations");
//        invitationRepository.deleteAllByExpiresAtBefore(Instant.now());
//    }
//
//}
