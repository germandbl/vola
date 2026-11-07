import { describe, expect, it } from "vitest";
import { DAYS_OF_WEEK, branchFormSchema, type BranchForm } from "./branches.js";

function createBranchForm(): BranchForm {
  return {
    name: "Col. Palmira",
    address: "Col. Palmira, frente al parque",
    latitude: 14.0989,
    longitude: -87.1907,
    openingHours: DAYS_OF_WEEK.map((day) => ({
      day,
      isOpen: true,
      opensAt: "08:00",
      closesAt: "17:00",
    })),
  };
}

describe("branchFormSchema", () => {
  it("accepts a branch open every day", () => {
    expect(branchFormSchema.safeParse(createBranchForm()).success).toBe(true);
  });

  it("accepts a closed day without hours", () => {
    const form = createBranchForm();
    form.openingHours[6] = {
      day: "sunday",
      isOpen: false,
      opensAt: null,
      closesAt: null,
    };
    expect(branchFormSchema.safeParse(form).success).toBe(true);
  });

  it("rejects an open day without a closing time", () => {
    const form = createBranchForm();
    form.openingHours[0].closesAt = null;
    const result = branchFormSchema.safeParse(form);
    expect(result.error?.issues[0].path).toEqual([
      "openingHours",
      0,
      "closesAt",
    ]);
  });

  it("rejects a closing time before the opening time", () => {
    const form = createBranchForm();
    form.openingHours[2].closesAt = "07:30";
    const result = branchFormSchema.safeParse(form);
    expect(result.error?.issues[0].path).toEqual([
      "openingHours",
      2,
      "closesAt",
    ]);
  });

  it("rejects a time that is not HH:MM", () => {
    const form = createBranchForm();
    form.openingHours[1].opensAt = "8am";
    const result = branchFormSchema.safeParse(form);
    expect(result.error?.issues[0].path).toEqual([
      "openingHours",
      1,
      "opensAt",
    ]);
  });

  it("rejects a latitude out of range", () => {
    const result = branchFormSchema.safeParse({
      ...createBranchForm(),
      latitude: 91,
    });
    expect(result.error?.issues[0].path).toEqual(["latitude"]);
  });

  it("rejects days out of order", () => {
    const form = createBranchForm();
    form.openingHours.reverse();
    expect(branchFormSchema.safeParse(form).success).toBe(false);
  });
});
