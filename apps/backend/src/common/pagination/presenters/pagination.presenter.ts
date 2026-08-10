import { PaginatedResponse } from '@sigip/shared';

export function toPaginatedResponse<TModel, TResponse>(
  items: TModel[],
  total: number,
  page: number,
  limit: number,
  presenter: (item: TModel) => TResponse,
): PaginatedResponse<TResponse> {
  const totalPages = Math.ceil(total / limit);

  return {
    items: items.map(presenter),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  };
}
