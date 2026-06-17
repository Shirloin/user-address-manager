import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addAddressApi } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';
import type { Address, AddressPayload } from '../types/domain.ts';

export function useAddAddress(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, AddressPayload>({
    mutationFn: (payload) => addAddressApi(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}
