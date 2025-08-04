package com.watchtogether.userprofileservice.service;

import com.watchtogether.userprofileservice.entity.NotificationPreferencesEntity;
import com.watchtogether.userprofileservice.entity.UserProfileEntity;
import com.watchtogether.userprofileservice.enums.PrivacyLevel;
import com.watchtogether.userprofileservice.event.UpdateUserCredEvent;
import com.watchtogether.userprofileservice.exception.UserProfileNotFoundException;
import com.watchtogether.userprofileservice.repostiory.UserProfileRepository;
import com.watchtogether.userprofileservice.request.UpdateUserProfileRequest;
import com.watchtogether.userprofileservice.event.UserRegisterEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class UserProfileService implements IUserProfileService {
    private final UserProfileRepository userProfileRepository;

    @Override
    public UserProfileEntity findUserProfileById(UUID id) {
        return userProfileRepository.findById(id)
                .orElseThrow(() -> new UserProfileNotFoundException
                                ("User profile with id " + id + " not found"));
    }

    @Override
    public void registerUser(UserRegisterEvent event) {
        UserProfileEntity userProfileEntity = new UserProfileEntity();
        userProfileEntity.setUserId(event.getUserId());
        userProfileEntity.setLogin(event.getLogin());
        userProfileEntity.setDisplayName(event.getLogin());
        userProfileEntity.setDisplayEmail(event.getEmail());
        userProfileRepository.save(userProfileEntity);
    }

    @Override
    public UserProfileEntity updateUserProfileById(UpdateUserProfileRequest request, UUID userId) {
        return Optional.ofNullable(findUserProfileById(userId))
                .map( u -> {
                    u.setDisplayName(request.getDisplayName());
                    u.setDisplayEmail(request.getDisplayEmail());
                    u.setBio(request.getBio());
                    return userProfileRepository.save(u);
                }).orElseThrow(() ->
                        new UserProfileNotFoundException("User profile with id " + userId + " not found"));
    }

    @Override
    public UserProfileEntity updateUserLoginById(UpdateUserCredEvent event) {
        return Optional.ofNullable(findUserProfileById(event.getUserId()))
                .map(u -> {
                    u.setLogin(event.getNewLogin());
                    return userProfileRepository.save(u);
                }).orElseThrow(() ->
                        new UserProfileNotFoundException("User profile with id " + event.getUserId() + " not found"));
    }

    @Override
    public UserProfileEntity updateUserEmailById(UpdateUserCredEvent event) {
        return Optional.ofNullable(findUserProfileById(event.getUserId()))
                .map(u -> {
                    u.setDisplayEmail(event.getNewLogin());
                    return userProfileRepository.save(u);
                }).orElseThrow(() ->
                        new UserProfileNotFoundException("User profile with id " + event.getUserId() + " not found"));
    }

    @Override
    public UserProfileEntity updateUserPrivacyLevel(PrivacyLevel privacyLevel, UUID userId) {
        return Optional.ofNullable(findUserProfileById(userId))
                .map(u -> {
                    u.setPrivacyLevel(privacyLevel);
                    return userProfileRepository.save(u);
                }).orElseThrow(() ->
                        new UserProfileNotFoundException("User profile with id " + userId + " not found"));
    }

    public void updateUserNotificationPreferences(NotificationPreferencesEntity notificationPreferences) {

    }//TODO: подумать как реализовать



}
