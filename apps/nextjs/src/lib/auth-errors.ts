// Keep server/database details out of form errors, including unexpected failures.
export function authErrorMessage(error: { code?: string; status?: number }) {
  if (error.status === 503 || error.code === 'AUTH_UNAVAILABLE') {
    return 'Authentication is currently unavailable. Please try again later.';
  }
  if (error.status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  switch (error.code) {
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return 'An account with this email already exists. Try logging in.';
    case 'USERNAME_IS_ALREADY_TAKEN':
      return 'This username is already taken. Choose another.';
    case 'USERNAME_REQUIRED':
      return 'Choose a username.';
    case 'NAME_REQUIRED':
      return 'Enter your name.';
    case 'USERNAME_TOO_SHORT':
    case 'USERNAME_TOO_LONG':
    case 'INVALID_USERNAME':
      return 'Use 3–30 letters, numbers, underscores, or dots for your username.';
    case 'INVALID_EMAIL':
      return 'Enter a valid email address.';
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
      return 'Use a password between 8 and 128 characters.';
    case 'INVALID_EMAIL_OR_PASSWORD':
    case 'INVALID_USERNAME_OR_PASSWORD':
      return 'The email, username, or password is incorrect.';
    default:
      return 'We could not complete your request. Please try again.';
  }
}
