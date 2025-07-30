package com.watchtogether.roomservice.entity;

import com.watchtogether.roomservice.enums.ParticipantRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "room_participants",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"}))
public class RoomParticipantEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipantRole role;

    @Column(name = "joined_at")
    @CreationTimestamp
    private Instant joinedAt;
}