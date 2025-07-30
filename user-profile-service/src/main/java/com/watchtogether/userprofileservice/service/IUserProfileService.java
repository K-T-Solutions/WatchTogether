package com.watchtogether.userprofileservice.service;

import com.watchtogether.userprofileservice.entity.UserProfileEntity;
import com.watchtogether.userprofileservice.enums.PrivacyLevel;
import com.watchtogether.userprofileservice.request.UpdateUserProfileRequest;
import com.watchtogether.userprofileservice.request.UserRegisterEvent;

import java.util.UUID;

public interface IUserProfileService {
    UserProfileEntity findUserProfileById(UUID id);

    void registerUser(UserRegisterEvent event);

    UserProfileEntity updateUserProfileById(UpdateUserProfileRequest request, UUID userId);

    UserProfileEntity updateUserPrivacyLevel(PrivacyLevel privacyLevel, UUID userId);
}
