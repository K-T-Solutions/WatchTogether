package com.watchtogether.roomservice.repository;

import com.watchtogether.roomservice.entity.InvitationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends CrudRepository<InvitationEntity, String> {


}
