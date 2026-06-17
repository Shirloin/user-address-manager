export const queryKeys = {
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
};
