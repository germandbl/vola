import { paginationQuerySchema } from "@vola/shared";
import { notFound } from "next/navigation";
import { z } from "zod";

const FIRST_PAGE = 1;

export function readPageNumber(page: string | string[] | undefined): number {
  const result = paginationQuerySchema.safeParse({ page });
  if (!result.success) return FIRST_PAGE;
  return result.data.page;
}

export function readIdParam(id: string): number {
  const result = z.coerce.number().int().positive().safeParse(id);
  if (!result.success) notFound();
  return result.data;
}
