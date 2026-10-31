import "server-only";
import { authUserSchema, type AuthUser } from "@vola/shared";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getApiUrl } from "./api-url";
import { getSessionToken } from "./session-cookie";

const HTTP_UNAUTHORIZED = 401;

export const getCurrentUser = cache(async (): Promise<AuthUser> => {
  const token = await getSessionToken();
  if (!token) redirect("/login");

  const response = await fetch(getApiUrl("/auth/me"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === HTTP_UNAUTHORIZED) redirect("/login");
  if (!response.ok) {
    throw new Error(`GET /auth/me failed with status ${response.status}`);
  }

  return authUserSchema.parse(await response.json());
});
