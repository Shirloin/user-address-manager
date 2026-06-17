import type { UserFieldsPayload } from '../types/domain.ts';

export type UserFieldErrors = Partial<Record<keyof UserFieldsPayload, string>>;

// Mirror of the backend rules on CreateUserRequest / UpdateUserRequest:
// firstName / lastName: required, max 50
// email:                required, valid format, max 100
const NAME_MAX = 50;
const EMAIL_MAX = 100;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function validateUserFields(
  values: UserFieldsPayload
): UserFieldErrors {
  const errors: UserFieldErrors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = 'Required';
  } else if (firstName.length > NAME_MAX) {
    errors.firstName = `Must be at most ${NAME_MAX} characters`;
  }

  const lastName = values.lastName.trim();
  if (!lastName) {
    errors.lastName = 'Required';
  } else if (lastName.length > NAME_MAX) {
    errors.lastName = `Must be at most ${NAME_MAX} characters`;
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Required';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Must be a valid email';
  } else if (email.length > EMAIL_MAX) {
    errors.email = `Must be at most ${EMAIL_MAX} characters`;
  }

  return errors;
}

export function hasUserFieldErrors(errors: UserFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function trimUserFields(values: UserFieldsPayload): UserFieldsPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
  };
}
