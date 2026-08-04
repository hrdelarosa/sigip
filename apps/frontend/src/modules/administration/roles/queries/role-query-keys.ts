export const roleQueryKeys = {
  all: ['roles'] as const,
  lists: () => [...roleQueryKeys.all, 'list'] as const,
  list: () => [...roleQueryKeys.lists()] as const,
  details: () => [...roleQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleQueryKeys.details(), id] as const,
  permissions: (id: string) =>
    [...roleQueryKeys.detail(id), 'permissions'] as const,
}
