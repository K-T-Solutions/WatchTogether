import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      twoFactorRequired
      token
    }
  }
`;

export const VALIDATE_OTP_MUTATION = gql`
  mutation ValidateOtp($email: String!, $code: String!) {
    validateOtp(email: $email, code: $code) {
      twoFactorRequired
      token
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