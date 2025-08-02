package com.watchtogether.authservice.entity;


import jakarta.persistence.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "two_factor_auth")
public class TwoFactorAuth {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AuthCredentialsEntity user;

    @Column(nullable = false)
    private String secretKey; // Для TOTP

    @ElementCollection
    @CollectionTable(name = "two_factor_recovery_codes", joinColumns = @JoinColumn(name = "two_factor_auth_id"))
    @Column(name = "recovery_code")
    private List<String> recoveryCodes = new ArrayList<>();

    @Column(nullable = false)
    private boolean enabled = false;

    private LocalDateTime lastUsed;

    // Конструкторы, геттеры, сеттеры
}
