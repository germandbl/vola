import { PAGE_SIZE, type Paginated } from '@vola/shared';

export function getPageOffset(page: number): number {
  return (page - 1) * PAGE_SIZE;
}

export function toPaginated<T>(
  items: T[],
  page: number,
  totalItems: number,
): Paginated<T> {
  return {
    items,
    page,
    pageSize: PAGE_SIZE,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / PAGE_SIZE)),
  };
}
