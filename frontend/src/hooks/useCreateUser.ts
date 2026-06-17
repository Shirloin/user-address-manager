import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUserApi } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';
import type { CreateUserPayload, UserSummary } from '../types/domain.ts';

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserSummary, Error, CreateUserPayload>({
    mutationFn: (payload) => createUserApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    },
  });
}
