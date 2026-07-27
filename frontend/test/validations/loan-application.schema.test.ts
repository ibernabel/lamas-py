import { describe, it, expect } from "vitest";
import {
  identitySchema,
  profileSchema,
  fullLoanApplicationSchema,
} from "../../lib/validations/loan-application.schema";

describe("Loan Application Schema Validations", () => {
  it("should validate a correct Dominican NID format", () => {
    const validData = {
      nid: "001-0000001-1",
      first_name: "Juan",
      last_name: "Pérez",
      mobile_phone: "8095550001",
      email: "juan@example.com",
    };
    const result = identitySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid Dominican NID format", () => {
    const invalidData = {
      nid: "00100000011", // missing dashes
      first_name: "Juan",
      last_name: "Pérez",
      mobile_phone: "8095550001",
      email: "juan@example.com",
    };
    const result = identitySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should enforce housing_monthly_payment when housing_type is RENTED", () => {
    const rentedNoPayment = {
      marital_status: "SINGLE",
      housing_type: "RENTED",
      time_at_residence_months: 12,
      dependents_count: 0,
      education_level: "UNIVERSITY",
    };
    const result = profileSchema.safeParse(rentedNoPayment);
    expect(result.success).toBe(false);

    const rentedWithPayment = {
      ...rentedNoPayment,
      housing_monthly_payment: 15000,
    };
    const validResult = profileSchema.safeParse(rentedWithPayment);
    expect(validResult.success).toBe(true);
  });
});
