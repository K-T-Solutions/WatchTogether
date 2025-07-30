package com.watchtogether.authservice.service.credentials;

import com.watchtogether.authservice.entity.AuthCredentialsEntity;

import java.util.UUID;

public interface ICredentialsService {


    AuthCredentialsEntity getByUserId(UUID userId);

    AuthCredentialsEntity updateEmail(UUID userId, String newEmail);

    AuthCredentialsEntity updateLogin(UUID userId, String newLogin);
}
