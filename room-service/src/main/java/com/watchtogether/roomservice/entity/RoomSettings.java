package com.watchtogether.roomservice.entity;

import com.watchtogether.roomservice.enums.InvitationPermission;
import com.watchtogether.roomservice.enums.PlaybackControlLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Embeddable
public class RoomSettings {
    @Column(nullable = false)
    private boolean allowQueueModifications = true;

    @Column(nullable = false)
    private boolean requireApproval = false; // Для новых участников

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PlaybackControlLevel controlLevel = PlaybackControlLevel.MODERATORS;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationPermission invitationPermission = InvitationPermission.MODERATORS;

    @Column(nullable = false)
    private boolean chatEnabled = true;
}
