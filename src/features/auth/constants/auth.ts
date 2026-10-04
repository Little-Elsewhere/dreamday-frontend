export enum AuthAction {
  SignIn = 'signIn',
  SignUp = 'signUp',
  ForgotPassword = 'forgotPassword',
  UpdatePassword = 'updatePassword',
  SignOut = 'signOut',
}

export enum AuthField {
  Name = 'name',
  Email = 'email',
  Password = 'password',
  ConfirmPassword = 'confirmPassword',
}

export enum AuthSessionState {
  Authenticated = 'authenticated',
  Unauthenticated = 'unauthenticated',
  Error = 'error',
}

export enum AuthEmailOtpType {
  Email = 'email',
  Signup = 'signup',
  Invite = 'invite',
  MagicLink = 'magiclink',
  Recovery = 'recovery',
  EmailChange = 'email_change',
}

export enum AuthConfirmationFailure {
  Link = 'link',
  System = 'system',
}

export enum AuthErrorCode {
  InvalidCredentials = 'invalid_credentials',
  EmailNotConfirmed = 'email_not_confirmed',
  EmailAddressInvalid = 'email_address_invalid',
  EmailExists = 'email_exists',
  UserAlreadyExists = 'user_already_exists',
  WeakPassword = 'weak_password',
  SamePassword = 'same_password',
  OverEmailSendRateLimit = 'over_email_send_rate_limit',
  OverRequestRateLimit = 'over_request_rate_limit',
  SessionExpired = 'session_expired',
  SessionNotFound = 'session_not_found',
  RefreshTokenNotFound = 'refresh_token_not_found',
  OtpExpired = 'otp_expired',
  ValidationFailed = 'validation_failed',
}

export enum AuthErrorName {
  SessionMissing = 'AuthSessionMissingError',
  InvalidJwt = 'AuthInvalidJwtError',
}
