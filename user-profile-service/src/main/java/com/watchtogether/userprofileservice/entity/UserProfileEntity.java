package com.watchtogether.userprofileservice.entity;

import com.watchtogether.userprofileservice.enums.PrivacyLevel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "user_profiles")
public class UserProfileEntity {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    private String login;

    @Column(name = "display_name")
    private String displayName;

    @Column
    private String avatarUrl;

    @Column
    private String bio;

    @Column(name = "email")
    private String displayEmail;

    @Column(name = "pending_email") //TODO: тут подумать как вообще будет проходить процесс смены почты
    private String pendingEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrivacyLevel privacyLevel = PrivacyLevel.PUBLIC;

    @Embedded
    private NotificationPreferencesEntity notificationPreferences = new NotificationPreferencesEntity();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


