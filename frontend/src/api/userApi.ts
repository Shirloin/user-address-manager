import axiosClient from './axiosClient.ts';
import type {
  Address,
  AddressPayload,
  CreateUserPayload,
  UpdateUserPayload,
  UserDetail,
  UserSummary,
} from '../types/domain.ts';

export async function fetchUsers(): Promise<UserSummary[]> {
  const { data } = await axiosClient.get<UserSummary[]>('/api/users');
  return data;
}

export async function fetchUser(id: string): Promise<UserDetail> {
  const { data } = await axiosClient.get<UserDetail>(`/api/users/${id}`);
  return data;
}

export async function createUserApi(
  payload: CreateUserPayload
): Promise<UserSummary> {
  const { data } = await axiosClient.post<UserSummary>('/api/users', payload);
  return data;
}

export async function updateUserApi(
  id: string,
  payload: UpdateUserPayload
): Promise<UserDetail> {
  const { data } = await axiosClient.put<UserDetail>(`/api/users/${id}`, payload);
  return data;
}

export async function addAddressApi(
  userId: string,
  payload: AddressPayload
): Promise<Address> {
  const { data } = await axiosClient.post<Address>(
    `/api/users/${userId}/addresses`,
    payload
  );
  return data;
}

export async function updateAddressApi(
  addressId: string,
  payload: AddressPayload
): Promise<Address> {
  const { data } = await axiosClient.put<Address>(
    `/api/addresses/${addressId}`,
    payload
  );
  return data;
}

export async function deleteAddressApi(addressId: string): Promise<string> {
  await axiosClient.delete(`/api/addresses/${addressId}`);
  return addressId;
}
