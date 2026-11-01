import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ListPaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
}

export function ListPagination({ basePath, page, totalPages }: ListPaginationProps) {
  if (totalPages <= 1) return null;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground">
        Página {page} de {totalPages}
      </p>
      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          {hasPreviousPage && (
            <PaginationItem>
              <PaginationPrevious
                href={`${basePath}?page=${page - 1}`}
                text="Anterior"
                aria-label="Ir a la página anterior"
              />
            </PaginationItem>
          )}
          {hasNextPage && (
            <PaginationItem>
              <PaginationNext
                href={`${basePath}?page=${page + 1}`}
                text="Siguiente"
                aria-label="Ir a la página siguiente"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
