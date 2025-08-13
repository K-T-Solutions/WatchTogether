import { gql } from '@apollo/client';

// Запрос для получения профиля пользователя по ID
export const GET_USER_PROFILE = gql`
  query GetUserProfile($userId: ID!) {
    getUserProfileById(userId: $userId) {
      id
      login
      displayName
      bio
      displayEmail
      joinDate
    }
  }
`;

// Легкий запрос только с нужными полями для списка комнат
export const GET_USER_PROFILE_MIN = gql`
  query GetUserProfileMin($userId: ID!) {
    getUserProfileById(userId: $userId) {
      id
      login
      displayName
    }
  }
`;

// Запрос для получения всех публичных комнат
export const GET_ALL_PUBLIC_ROOMS = gql`
  query GetAllPublicRooms {
    getAllPublicRooms {
      roomId
      roomCreator {
        userId
        displayName
      }
      roomName
      roomDescription
      roomType
      roomCategory
      maxParticipants
      needPassword
      participantsNumber
      createdAt
    }
  }
`; 

// Получение комнаты по ID (для детальной страницы)
export const GET_ROOM_BY_ID = gql`
  query GetRoomById($roomId: ID!) {
    getRoomById(roomId: $roomId) {
      roomId
      roomCreator {
        userId
        displayName
      }
      roomName
      roomDescription
      roomType
      roomCategory
      maxParticipants
      needPassword
      participantsNumber
      createdAt
    }
  }
`;