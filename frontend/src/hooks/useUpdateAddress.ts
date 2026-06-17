import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAddressApi } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';
import type { Address, AddressPayload } from '../types/domain.ts';

interface UpdateAddressVars {
  addressId: string;
  payload: AddressPayload;
}

export function useUpdateAddress(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, UpdateAddressVars>({
    mutationFn: ({ addressId, payload }) => updateAddressApi(addressId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}
