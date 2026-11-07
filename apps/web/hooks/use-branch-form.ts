import {
  DAYS_OF_WEEK,
  DayOfWeek,
  branchFormSchema,
  type Branch,
  type BranchForm,
} from "@vola/shared";
import { useState, useTransition, type FormEvent } from "react";
import type { BranchSaveResult } from "@/lib/branch-actions";
import type { Coordinates } from "@/lib/map-defaults";
import { toFieldErrors } from "@/lib/form-state";

export interface OpeningHoursInput {
  day: DayOfWeek;
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
}

export type BranchTextField = "name" | "address";

const DEFAULT_OPENS_AT = "08:00";
const DEFAULT_CLOSES_AT = "17:00";

function createDefaultOpeningHours(): OpeningHoursInput[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    isOpen: day !== DayOfWeek.Sunday,
    opensAt: DEFAULT_OPENS_AT,
    closesAt: DEFAULT_CLOSES_AT,
  }));
}

function toOpeningHoursInputs(branch: Branch): OpeningHoursInput[] {
  return branch.openingHours.map((hours) => ({
    day: hours.day,
    isOpen: hours.isOpen,
    opensAt: hours.opensAt ?? DEFAULT_OPENS_AT,
    closesAt: hours.closesAt ?? DEFAULT_CLOSES_AT,
  }));
}

function toTimeOrNull(value: string): string | null {
  if (value === "") return null;
  return value;
}

function toForm(
  fields: Record<BranchTextField, string>,
  location: Coordinates,
  openingHours: OpeningHoursInput[],
): BranchForm {
  return {
    name: fields.name,
    address: fields.address,
    latitude: location.latitude,
    longitude: location.longitude,
    openingHours: openingHours.map((hours) => ({
      day: hours.day,
      isOpen: hours.isOpen,
      opensAt: hours.isOpen ? toTimeOrNull(hours.opensAt) : null,
      closesAt: hours.isOpen ? toTimeOrNull(hours.closesAt) : null,
    })),
  };
}

export function useBranchForm(
  save: (form: BranchForm) => Promise<BranchSaveResult>,
  initialLocation: Coordinates,
  branch?: Branch,
) {
  const [fields, setFields] = useState<Record<BranchTextField, string>>({
    name: branch?.name ?? "",
    address: branch?.address ?? "",
  });
  const [location, setLocation] = useState(initialLocation);
  const [openingHours, setOpeningHours] = useState(() =>
    branch ? toOpeningHoursInputs(branch) : createDefaultOpeningHours(),
  );
  const [result, setResult] = useState<BranchSaveResult>({ fieldErrors: {} });
  const [isPending, startTransition] = useTransition();

  function updateField(field: BranchTextField, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function updateOpeningHours(day: DayOfWeek, changes: Partial<OpeningHoursInput>) {
    setOpeningHours((current) =>
      current.map((hours) => (hours.day === day ? { ...hours, ...changes } : hours)),
    );
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = branchFormSchema.safeParse(toForm(fields, location, openingHours));
    if (!validation.success) {
      setResult({ fieldErrors: toFieldErrors(validation.error.issues) });
      return;
    }
    startTransition(async () => {
      setResult(await save(validation.data));
    });
  }

  return {
    fields,
    location,
    openingHours,
    result,
    isPending,
    updateField,
    setLocation,
    updateOpeningHours,
    submit,
  };
}
