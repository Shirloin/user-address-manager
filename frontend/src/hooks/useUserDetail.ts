import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';
import type { UserDetail } from '../types/domain.ts';

export function useUserDetail(id: string | undefined) {
  return useQuery<UserDetail, Error>({
    queryKey: queryKeys.user(id ?? ''),
    queryFn: () => fetchUser(id as string),
    enabled: Boolean(id),
  });
}
