import { describe, it, expect } from "vitest";
import {
  identitySchema,
  profileSchema,
  jobSchema,
  fullLoanApplicationSchema,
} from "../../lib/validations/loan-application.schema";

// ---------------------------------------------------------------------------
// Identity Schema
// ---------------------------------------------------------------------------

describe("identitySchema", () => {
  it("should validate a correct Dominican NID format", () => {
    const result = identitySchema.safeParse({
      nid: "001-0000001-1",
      first_name: "Juan",
      last_name: "Pérez",
      mobile_phone: "8095550001",
      email: "juan@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("should fail on invalid Dominican NID format (no dashes)", () => {
    const result = identitySchema.safeParse({
      nid: "00100000011",
      first_name: "Juan",
      last_name: "Pérez",
      mobile_phone: "8095550001",
      email: "juan@example.com",
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// profileSchema — marital_status
// ---------------------------------------------------------------------------

describe("profileSchema — marital_status", () => {
  const baseProfile = {
    housing_type: "owned",
    time_at_residence_months: 12,
    dependents_count: 0,
    education_level: "bachelor",
  };

  it("should accept all valid lowercase marital_status values", () => {
    const validValues = ["single", "married", "divorced", "widowed", "common_law"];
    for (const value of validValues) {
      const result = profileSchema.safeParse({ ...baseProfile, marital_status: value });
      expect(result.success, `Expected '${value}' to be valid`).toBe(true);
    }
  });

  it("should reject UPPERCASE 'SINGLE'", () => {
    const result = profileSchema.safeParse({ ...baseProfile, marital_status: "SINGLE" });
    expect(result.success).toBe(false);
  });

  it("should reject UPPERCASE 'COMMON_LAW'", () => {
    const result = profileSchema.safeParse({ ...baseProfile, marital_status: "COMMON_LAW" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// profileSchema — education_level
// ---------------------------------------------------------------------------

describe("profileSchema — education_level", () => {
  const baseProfile = {
    marital_status: "single",
    housing_type: "owned",
    time_at_residence_months: 12,
    dependents_count: 0,
  };

  it("should accept all 8 valid education_level values", () => {
    const validValues = [
      "primary", "secondary", "high_school", "technical",
      "bachelor", "postgraduate", "master", "doctorate",
    ];
    for (const value of validValues) {
      const result = profileSchema.safeParse({ ...baseProfile, education_level: value });
      expect(result.success, `Expected '${value}' to be valid`).toBe(true);
    }
  });

  it("should accept 'technical' (Dominican-context addition)", () => {
    const result = profileSchema.safeParse({ ...baseProfile, education_level: "technical" });
    expect(result.success).toBe(true);
  });

  it("should accept 'high_school' as separate from secondary", () => {
    const result = profileSchema.safeParse({ ...baseProfile, education_level: "high_school" });
    expect(result.success).toBe(true);
  });

  it("should reject UPPERCASE 'UNIVERSITY'", () => {
    const result = profileSchema.safeParse({ ...baseProfile, education_level: "UNIVERSITY" });
    expect(result.success).toBe(false);
  });

  it("should reject UPPERCASE 'TECHNICAL'", () => {
    const result = profileSchema.safeParse({ ...baseProfile, education_level: "TECHNICAL" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// profileSchema — housing_type (possession semantics)
// ---------------------------------------------------------------------------

describe("profileSchema — housing_type", () => {
  const baseProfile = {
    marital_status: "single",
    time_at_residence_months: 12,
    dependents_count: 0,
    education_level: "bachelor",
  };

  it("should accept all valid lowercase housing_type values", () => {
    // Note: "rented" requires housing_monthly_payment > 0 (refine rule).
    // It is tested separately in the refine test below.
    const validValues = ["owned", "mortgaged", "family"];
    for (const value of validValues) {
      const result = profileSchema.safeParse({ ...baseProfile, housing_type: value });
      expect(result.success, `Expected '${value}' to be valid`).toBe(true);
    }
    // "rented" with payment must also succeed
    const rentedResult = profileSchema.safeParse({
      ...baseProfile,
      housing_type: "rented",
      housing_monthly_payment: 10000,
    });
    expect(rentedResult.success, "Expected 'rented' with payment to be valid").toBe(true);
  });

  it("should accept 'family' (Dominican-context addition)", () => {
    const result = profileSchema.safeParse({ ...baseProfile, housing_type: "family" });
    expect(result.success).toBe(true);
  });

  it("should reject UPPERCASE 'OWNED'", () => {
    const result = profileSchema.safeParse({ ...baseProfile, housing_type: "OWNED" });
    expect(result.success).toBe(false);
  });

  it("should enforce housing_monthly_payment when housing_type is 'rented'", () => {
    // Missing payment → invalid
    const withoutPayment = profileSchema.safeParse({
      ...baseProfile,
      housing_type: "rented",
    });
    expect(withoutPayment.success).toBe(false);

    // With payment → valid
    const withPayment = profileSchema.safeParse({
      ...baseProfile,
      housing_type: "rented",
      housing_monthly_payment: 15000,
    });
    expect(withPayment.success).toBe(true);
  });

  it("should NOT enforce housing_monthly_payment when housing_type is 'owned'", () => {
    const result = profileSchema.safeParse({
      ...baseProfile,
      housing_type: "owned",
    });
    expect(result.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// jobSchema — occupation_type
// ---------------------------------------------------------------------------

describe("jobSchema — occupation_type", () => {
  const baseJob = {
    company_name: "Empresa Test SRL",
    role: "Analista",
    salary: 50000,
    payment_bank: "BANRESERVAS",
    employment_start_date: "2023-01-01",
  };

  it("should accept all valid lowercase occupation_type values", () => {
    const validValues = ["employed", "independent", "business_owner", "other"];
    for (const value of validValues) {
      const result = jobSchema.safeParse({ ...baseJob, occupation_type: value });
      expect(result.success, `Expected '${value}' to be valid`).toBe(true);
    }
  });

  it("should reject UPPERCASE 'EMPLOYED'", () => {
    const result = jobSchema.safeParse({ ...baseJob, occupation_type: "EMPLOYED" });
    expect(result.success).toBe(false);
  });

  it("should reject UPPERCASE 'BUSINESS_OWNER'", () => {
    const result = jobSchema.safeParse({ ...baseJob, occupation_type: "BUSINESS_OWNER" });
    expect(result.success).toBe(false);
  });
});
