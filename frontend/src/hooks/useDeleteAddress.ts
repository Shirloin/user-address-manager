import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAddressApi } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';

export function useDeleteAddress(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: (addressId) => deleteAddressApi(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user(userId) });
    },
  });
}
