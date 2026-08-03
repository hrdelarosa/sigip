export const permissionQueryKeys = {
  all: ['permissions'] as const,
  lists: () => [...permissionQueryKeys.all, 'list'] as const,
  list: () => [...permissionQueryKeys.lists()] as const,
  details: () => [...permissionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...permissionQueryKeys.details(), id] as const,
}
