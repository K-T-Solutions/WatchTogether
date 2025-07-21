package com.watchtogether.userprofileservice.repostiory;

import com.watchtogether.userprofileservice.entity.UserProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfileEntity, UUID> {


}
