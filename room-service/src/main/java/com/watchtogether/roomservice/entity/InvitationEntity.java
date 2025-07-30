package com.watchtogether.roomservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "room_invitations")
public class InvitationEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "can_be_used_times")
    private int maxUses = 1;

    @Column(name = "uses_number")
    private int useCount = 0;

    @Column(name = "created_at")
    @CreationTimestamp
    private Instant createdAt;
}
