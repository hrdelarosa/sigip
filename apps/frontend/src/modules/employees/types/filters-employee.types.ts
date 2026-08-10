import type { itemsOrder } from '../constants/filters-employees.constants'

export type SortField = (typeof itemsOrder)[number]['value']

export type SortDirection = 'asc' | 'desc'
