export type FieldErrors = Partial<Record<string, string>>;

export interface FormState {
  values: Record<string, string>;
  fieldErrors: FieldErrors;
  formError?: string;
  isSaved?: boolean;
}

export const INITIAL_FORM_STATE: FormState = { values: {}, fieldErrors: {} };

interface ValidationIssue {
  path: PropertyKey[];
  message: string;
}

export function toFieldErrors(issues: ValidationIssue[]): FieldErrors {
  const fieldErrors: FieldErrors = {};
  for (const issue of issues) {
    const field = String(issue.path[0]);
    fieldErrors[field] ??= issue.message;
  }
  return fieldErrors;
}
