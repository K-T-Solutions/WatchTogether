package com.watchtogether.chatservice.service;

import com.watchtogether.chatservice.entity.ChatChannel;
import com.watchtogether.chatservice.entity.PrivateMessage;
import com.watchtogether.chatservice.event.MessageEvent;
import com.watchtogether.chatservice.kafka.KafkaProducer;
import com.watchtogether.chatservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;

@RequiredArgsConstructor
@Service
public class MessageService {
//    private final SimpMessagingTemplate messagingTemplate;



    private final KafkaProducer kafkaProducer;
    private final SimpMessagingTemplate messagingTemplate;
    private final MessageRepository messageRepository;
    private final IChannelService channelService;

//    @Transactional //TODO: зачем?
    public void sendPrivateMessage(UUID senderId, UUID receiverId, String content) { //TODO: добавить возможность как бы отвечать на сообщения
        ChatChannel channel = channelService.getOrCreatePrivateChatChannel(senderId, receiverId);

        PrivateMessage message = new PrivateMessage();
        message.setSenderId(senderId);
        message.setRecipientId(receiverId);
        message.setContent(content);
//        message. //TODO: надо как то связать сообщение с самим чатом

        PrivateMessage savedMessage = messageRepository.save(message);

        // Отправка через WebSocket
        messagingTemplate.convertAndSendToUser(
                receiverId.toString(),
                "/queue/private-messages", //TODO: change
                message
        );

        //отправка уведомления
        kafkaProducer.sendNewMessageNotification(
                MessageEvent.builder() //TODO: проверить появляется ли инстант
                        .eventType(MessageEvent.EventType.PRIVATE_MESSAGE)
                        .messageId(savedMessage.getId())
                        .senderId(savedMessage.getSenderId())
                        .receiverId(savedMessage.getRecipientId())
                        .content(savedMessage.getContent())
                        .build());



    }



}