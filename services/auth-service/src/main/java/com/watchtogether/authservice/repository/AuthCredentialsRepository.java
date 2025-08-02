package com.watchtogether.authservice.repository;

import com.watchtogether.authservice.entity.AuthCredentialsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AuthCredentialsRepository extends JpaRepository<AuthCredentialsEntity, UUID> {


    boolean existsByLogin(String login);

    boolean existsByEmail(String email);

    Optional<AuthCredentialsEntity> findByLoginOrEmail(String login, String email);



}
