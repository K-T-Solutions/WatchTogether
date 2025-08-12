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

// Мутация для обновления логина пользователя
export const UPDATE_USER_LOGIN = gql`
  mutation UpdateUserLogin($userId: ID!, $newLogin: String!) {
    updateUserLogin(userId: $userId, newLogin: $newLogin) {
      message
    }
  }
`;

// Мутация для обновления пароля пользователя
export const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword($userId: ID!, $oldPass: String!, $newPass: String!) {
    updateUserPassword(userId: $userId, oldPass: $oldPass, newPass: $newPass) {
      message
    }
  }
`;

// Мутация для создания комнаты
export const CREATE_ROOM = gql`
  mutation CreateRoom($input: CreateRoomRequest!) {
    createRoom(input: $input) {
      success
      message
    }
  }
`; 