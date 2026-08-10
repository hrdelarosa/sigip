export const organizationalUnitQueryKeys = {
  all: ['organizational-units'] as const,
  lists: () => [...organizationalUnitQueryKeys.all, 'list'] as const,
  list: () => [...organizationalUnitQueryKeys.lists()] as const,
  details: () => [...organizationalUnitQueryKeys.all, 'detail'] as const,
  detail: (id: string) =>
    [...organizationalUnitQueryKeys.details(), id] as const,
}
