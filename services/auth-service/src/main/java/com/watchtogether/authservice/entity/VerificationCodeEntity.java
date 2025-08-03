package com.watchtogether.authservice.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "verification_tokens")
public class VerificationCodeEntity { //TODO: мб в редисе сделать

    public enum CodeType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET,
        EMAIL_CHANGE
    }

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AuthCredentialsEntity user;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CodeType type;

    @Column
    private String newEmail; // Для смены email

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    private boolean used = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // Конструкторы, геттеры, сеттеры
}
