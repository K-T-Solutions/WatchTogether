package com.watchtogether.roomservice.entity;

import com.watchtogether.grpc.RoomCategory;
import com.watchtogether.grpc.RoomType;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;
import org.springframework.data.redis.core.index.Indexed;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.io.Serializable;

@Getter
@Setter
@RedisHash(value = "active_room")
public class ActiveRoomEntity implements Serializable {
    @Id
    private String id; // String для Redis ключей, можно генерировать из UUID

    @Indexed // для поиска по владельцу
    private String ownerId;

    private String name;
    private String description;

    @Indexed
    private RoomType type = RoomType.PUBLIC;

    @Indexed
    private RoomCategory category;

    private String passwordHash; // Для комнат с паролем

    private int maxParticipants = 20;

    // Активные участники (кто сейчас в комнате)
    private Set<String> participantIds = new HashSet<>();

    // Модераторы
    private Set<String> moderatorIds = new HashSet<>();

    // Забаненные пользователи
    private Set<String> bannedUserIds = new HashSet<>();

    private Set<String> tags = new HashSet<>();

    // Настройки комнаты
//    private RoomSettings settings = new RoomSettings();

    // Временные метки для управления жизненным циклом
    private Instant createdAt;
    private Instant lastActivity; // Когда была последняя активность
    private Instant lastExtensionCheck; // Когда последний раз проверяли на продление

    // Флаги состояния
    private boolean extensionNotificationSent = false;
    private boolean extensionPending = false;

    // TTL в секундах (25 часов как fallback)
    @TimeToLive
    private Long ttl = 90000L;

    // ОБЯЗАТЕЛЬНЫЙ конструктор по умолчанию для Spring Data
    public ActiveRoomEntity() {
        this.participantIds = new HashSet<>();
        this.moderatorIds = new HashSet<>();
        this.bannedUserIds = new HashSet<>();
        this.tags = new HashSet<>();
    }

    // Конструктор для создания новой комнаты
    public ActiveRoomEntity(String ownerId,
                            String name,
                            String description,
                            RoomType type,
                            RoomCategory category,
                            String password,
                            int maxParticipants) {
        this(); // Вызываем конструктор по умолчанию для инициализации коллекций
        this.id = UUID.randomUUID().toString(); //TODO: надо как-то убеждаться что он не будет повторяться
        this.ownerId = ownerId;
        this.name = name;
        this.description = description;
        this.type = type;
        this.category = category;
        this.passwordHash = password;
        this.maxParticipants = maxParticipants;
        this.createdAt = Instant.now();
        this.lastActivity = Instant.now();

        // Владелец автоматически становится участником и модератором
        this.participantIds.add(ownerId);
        this.moderatorIds.add(ownerId);
    }

    // Вспомогательные методы для работы с участниками
    public void addParticipant(String userId) {
        this.participantIds.add(userId);
        updateLastActivity();
    }

    public void removeParticipant(String userId) {
        this.participantIds.remove(userId);
        // Если это был модератор, тоже убираем
        this.moderatorIds.remove(userId);
        updateLastActivity();
    }

    public boolean isEmpty() {
        return participantIds.isEmpty();
    }

    public boolean isOwner(String userId) {
        return ownerId.equals(userId);
    }

    public boolean isModerator(String userId) {
        return moderatorIds.contains(userId);
    }

    public boolean isBanned(String userId) {
        return bannedUserIds.contains(userId);
    }

    public void updateLastActivity() {
        this.lastActivity = Instant.now();
    }

    // Проверка, нужно ли отправлять уведомление о продлении
    public boolean needsExtensionNotification() {
        if (extensionNotificationSent) {
            return false;
        }

        Instant threshold = Instant.now().minusSeconds(86400); // 24 часа назад
        return createdAt.isBefore(threshold);
    }

    // Сброс статуса продления (когда комната продлена)
    public void resetExtensionStatus() {
        this.createdAt = Instant.now(); // Перезапускаем отсчет
        this.extensionNotificationSent = false;
        this.extensionPending = false;
        this.lastExtensionCheck = Instant.now();
        updateLastActivity();
    }

    // Пометить, что уведомление отправлено
    public void markExtensionNotificationSent() {
        this.extensionNotificationSent = true;
        this.extensionPending = true;
        this.lastExtensionCheck = Instant.now();
    }

    // Convenience method для проверки, является ли комната публичной
    public boolean isPublic() {
        return this.type == RoomType.PUBLIC;
    }
}