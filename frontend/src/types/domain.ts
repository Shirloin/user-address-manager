export interface UserSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UserDetail extends UserSummary {
  addresses: Address[];
}

export interface UserFieldsPayload {
  firstName: string;
  lastName: string;
  email: string;
}

export type CreateUserPayload = UserFieldsPayload;
export type UpdateUserPayload = UserFieldsPayload;

export interface AddressPayload {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
