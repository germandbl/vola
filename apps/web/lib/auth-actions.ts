"use server";

import { loginResponseSchema, loginSchema } from "@vola/shared";
import { z } from "zod";
import { redirect } from "next/navigation";
import { getApiUrl } from "./api-url";
import {
  deleteSessionToken,
  getSessionToken,
  saveSessionToken,
} from "./session-cookie";

const HTTP_UNAUTHORIZED = 401;

export interface LoginState {
  email: string;
  fieldErrors: { email?: string; password?: string };
  formError?: string;
}

function readField(formData: FormData, name: string): string {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value;
}

const LOGIN_FAILED_MESSAGE =
  "No pudimos iniciar sesión. Probá de nuevo en un momento.";

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = readField(formData, "email");
  const result = loginSchema.safeParse({
    email,
    password: readField(formData, "password"),
  });
  if (!result.success) {
    const { fieldErrors } = z.flattenError(result.error);
    return {
      email,
      fieldErrors: {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  let response: Response;
  try {
    response = await fetch(getApiUrl("/auth/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
  } catch {
    return { email, fieldErrors: {}, formError: LOGIN_FAILED_MESSAGE };
  }

  if (response.status === HTTP_UNAUTHORIZED) {
    return {
      email,
      fieldErrors: {},
      formError: "El email o la contraseña no coinciden. Probá de nuevo.",
    };
  }
  if (!response.ok) {
    return { email, fieldErrors: {}, formError: LOGIN_FAILED_MESSAGE };
  }

  const { token } = loginResponseSchema.parse(await response.json());
  await saveSessionToken(token);
  redirect("/");
}

export async function logout(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    const response = await fetch(getApiUrl("/auth/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok && response.status !== HTTP_UNAUTHORIZED) {
      throw new Error(`POST /auth/logout failed with status ${response.status}`);
    }
  }

  await deleteSessionToken();
  redirect("/login");
}
