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