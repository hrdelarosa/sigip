export const officeQueryKeys = {
  all: ["offices"] as const,
  list: () => [...officeQueryKeys.all, "list"] as const,
  detail: (id: string) => [...officeQueryKeys.all, "detail", id] as const,
};
