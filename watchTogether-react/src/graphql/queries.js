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

// Запрос для получения всех публичных комнат
export const GET_ALL_PUBLIC_ROOMS = gql`
  query GetAllPublicRooms {
    getAllPublicRooms {
      roomId
      ownerId
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