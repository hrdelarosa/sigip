import { parseAsInteger } from 'nuqs'

export const userSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
}
