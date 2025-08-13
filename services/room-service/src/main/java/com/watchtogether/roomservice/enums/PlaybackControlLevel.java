package com.watchtogether.roomservice.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.EnumSet;
import java.util.Set;

@AllArgsConstructor
@Getter
public enum PlaybackControlLevel {
//    OWNER_ONLY("Owner Only",
//            "Only room owner can control playback",
//            EnumSet.of(ParticipantRole.OWNER)),
//    MODERATORS("Moderators+",
//            "Owner and assigned moderators",
//            EnumSet.of(ParticipantRole.OWNER, ParticipantRole.MODERATOR)),
//    VIP_MEMBERS("VIP Members",
//            "VIP members and above",
//            EnumSet.of(ParticipantRole.OWNER, ParticipantRole.MODERATOR, ParticipantRole.VIP)),
//    ALL_MEMBERS("All Members",
//            "Any member can control (not recommended)",
//            EnumSet.of(ParticipantRole.OWNER, ParticipantRole.MODERATOR, ParticipantRole.VIP, ParticipantRole.MEMBER));
//
//    private final String displayName;
//    private final String description;
//    private final Set<ParticipantRole> allowedRoles;
}