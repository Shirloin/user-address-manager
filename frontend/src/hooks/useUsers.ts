import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/userApi.ts';
import { queryKeys } from './queryKeys.ts';
import type { UserSummary } from '../types/domain.ts';

export function useUsers() {
  return useQuery<UserSummary[], Error>({
    queryKey: queryKeys.users,
    queryFn: fetchUsers,
  });
}
