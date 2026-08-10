export const positionQueryKeys = {
  all: ['positions'] as const,
  lists: () => [...positionQueryKeys.all, 'list'] as const,
  list: () => [...positionQueryKeys.lists()] as const,
  details: () => [...positionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...positionQueryKeys.details(), id] as const,
}
