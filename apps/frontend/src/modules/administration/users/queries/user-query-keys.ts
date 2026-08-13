export const userQueryKeys = {
  all: ['users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: () => [...userQueryKeys.lists()] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...userQueryKeys.details(), id] as const,
  sessions: (id: string) => [...userQueryKeys.detail(id), 'sessions'] as const,
}
