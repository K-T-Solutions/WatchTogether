package com.watchtogether.roomservice.entity;

import com.watchtogether.roomservice.enums.RoomCategory;
import com.watchtogether.roomservice.enums.RoomType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "rooms")
public class RoomEntity {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;
//    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomType type = RoomType.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomCategory category;

    @Column(name = "password_hash")
    private String passwordHash; // Для комнат с паролем

    @Column(name = "max_participants", nullable = false)
    private int maxParticipants = 20;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @ElementCollection
    @CollectionTable(name = "room_moderators", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "moderator_id")
    private Set<UUID> moderatorIds = new HashSet<>(); //TODO: переделать в список пользователей ( не ток модераторов)

//    private Map<UUID, RoomParticipantEntity> roomParticipants = new HashMap<>();

//    @OneToMany()
//    private List<RoomParticipantEntity> roomParticipants = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "room_banned_users", joinColumns = @JoinColumn(name = "room_id"))
    @Column(name = "user_id")
    private Set<UUID> bannedUserIds = new HashSet<>();

    @ElementCollection
    private Set<String> tags = new HashSet<>();

    private String language = "en";

    @Embedded
    private RoomSettings settings = new RoomSettings();

    @CreationTimestamp
    private Instant createdAt;
}
