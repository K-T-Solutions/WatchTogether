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
    private UUID userId; // Совпадает с ID из auth-service

    private String login;

    @Column(name = "display_name", nullable = false, unique = true)
    private String displayName;

    @Column
    private String avatarUrl; // Ссылка на аватар в S3/MinIO

    @Column
    private String bio; // Описание профиля

    @Column
    private String location; // Местоположение

    @Column(name = "email")
    private String displayEmail; // Отображаемая почта (дублирует email из auth)

    @Column(name = "pending_email") //TODO: и тут пошаманить
    private String pendingEmail; // Почта, ожидающая подтверждения
//
//    @Column
//    private String websiteUrl; // Ссылка на сайт
//
//    @Column
//    private String twitterHandle; // Twitter аккаунт
//
//    @Column
//    private String discordHandle; // Discord аккаунт

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


