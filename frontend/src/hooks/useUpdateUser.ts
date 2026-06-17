import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserApi } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';
import type { UpdateUserPayload, UserDetail } from '../types/domain.ts';

export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<UserDetail, Error, UpdateUserPayload>({
    mutationFn: (payload) => updateUserApi(userId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user(userId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}
