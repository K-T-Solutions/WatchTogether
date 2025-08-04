package com.watchtogether.authservice.service.credentials;

import com.watchtogether.authservice.entity.AuthCredentialsEntity;
import com.watchtogether.authservice.event.UpdateUserCredEvent;
import com.watchtogether.authservice.exception.EmailAlreadyTakenException;
import com.watchtogether.authservice.exception.InvalidCredentialsException;
import com.watchtogether.authservice.exception.LoginAlreadyTakenException;
import com.watchtogether.authservice.exception.UserNotFoundException;
import com.watchtogether.authservice.kafka.KafkaProducer;
import com.watchtogether.authservice.repository.AuthCredentialsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CredentialsService implements ICredentialsService {
    private final AuthCredentialsRepository repository;
    private final KafkaProducer kafkaProducer;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthCredentialsEntity getByUserId(UUID userId) {
        return repository.findById(userId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User with id " + userId + " not found"));
    }

    @Override
    public AuthCredentialsEntity updateEmail(UUID userId, String newEmail) {
        if (repository.existsByEmail(newEmail)) {
            throw new EmailAlreadyTakenException("This email already exists");
        }

        return Optional.ofNullable(getByUserId(userId)) //TODO: создавать 2fa сущность
                .map(u -> {
                    u.setEmail(newEmail);
//                    kafkaProducer.sendUpdateUserCredEvent(
//                            UpdateUserCredEvent.builder()
//                                    .userId(userId)
//                                    .newLogin(u.getEmail())
////                                    .credType("EMAIL")
//                                    .build());
                    return repository.save(u);
                }).orElseThrow(() ->
                        new UserNotFoundException("User with id " + userId + " not found"));
    }

    @Override
    public AuthCredentialsEntity updateLogin(UUID userId, String newLogin) {
        if (repository.existsByLogin(newLogin)) {
            throw new LoginAlreadyTakenException("This login already exists");
        }

        return Optional.ofNullable(getByUserId(userId))
                .map(u -> {
                    u.setLogin(newLogin);
                    kafkaProducer.sendUpdateUserCredEvent(
                            UpdateUserCredEvent.builder()
                                    .userId(userId)
                                    .newLogin(u.getLogin())
//                                    .credType("LOGIN")
                                    .build());
                    return repository.save(u);
                }).orElseThrow(() ->
                        new UserNotFoundException("User with id " + userId + " not found"));
    }

    @Override
    public AuthCredentialsEntity updatePassword(UUID userId, String oldPassword, String newPassword) {
        return Optional.ofNullable(getByUserId(userId))
                .filter(u -> passwordEncoder.matches(
                        oldPassword,
                        u.getPasswordHash()
                )).map(u -> {
                    u.setPasswordHash(passwordEncoder.encode(newPassword));
                    return repository.save(u);
                }).orElseThrow(() ->
                        new InvalidCredentialsException("Invalid password"));
    }

}
