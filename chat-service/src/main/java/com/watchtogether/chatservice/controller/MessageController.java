package com.watchtogether.chatservice.controller;

import com.watchtogether.chatservice.dto.PrivateMessageRequest;
import com.watchtogether.chatservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/private")
    public ResponseEntity<Void> sendPrivateMessage(@RequestBody PrivateMessageRequest request) {
        messageService.sendPrivateMessage(request.getSenderId(), request.getReceiverId(), request.getContent());
        return ResponseEntity.ok().build();
    }
} 