package com.watchtogether.userprofileservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Embeddable
public class NotificationPreferencesEntity {
    @Column(name = "notify_friend_requests", nullable = false)
    private boolean friendRequests = true;

    @Column(name = "notify_room_invites", nullable = false)
    private boolean roomInvites = true;

    @Column(name = "notify_messages", nullable = false)
    private boolean messages = true;

    @Column(name = "notify_mentions", nullable = false)
    private boolean mentions = true;

    @Column(name = "notify_weekly_stats", nullable = false)
    private boolean weeklyStats = true;  //TODO: подумать надо или нет

}
