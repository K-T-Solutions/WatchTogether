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

export const GET_USER_CRED_QUERY = gql`
  query GetUserCred($userId: ID!) {
    getUserCred(userId: $userId) {
      emailVerified
      login
      email
      enabled
      createdAt
    }
  }
`;

export const ENABLE_TWO_FACTOR_MUTATION = gql`
  mutation EnableTwoFactor($userId: ID!) {
    enableTwoFactor(userId: $userId) {
      message
    }
  }
`;

export const SEND_EMAIL_VERIFICATION_CODE = gql`
  query SendEmailVerificationCode($userId: ID!) {
    sendEmailVerificationCode(userId: $userId)
  }
`;

export const VERIFY_EMAIL_CODE = gql`
  query VerifyEmailCode($userId: ID!, $code: String!) {
    verifyEmailCode(userId: $userId, code: $code)
  }
`;