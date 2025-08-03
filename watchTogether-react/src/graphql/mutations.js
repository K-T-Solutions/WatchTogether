import { gql } from '@apollo/client';

// Мутация для обновления публичного профиля пользователя
export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile($request: UpdateUserProfileRequest!) {
    updateUserProfileById(request: $request) {
      id
      login
      displayName
      bio
      displayEmail
      joinDate
    }
  }
`; 