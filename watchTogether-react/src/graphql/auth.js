import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      message
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($login: String!, $email: String!, $password: String!) {
    register(login: $login, email: $email, password: $password) {
      result
      message
    }
  }
`;

export const VALIDATE_TOKEN_QUERY = gql`
  query ValidateToken($token: String!) {
    validateToken(token: $token)
  }
`; 