/**
 * Unit tests for customer Zod validation schemas.
 * Tests happy paths, edge cases, and validation error messages.
 */
import { describe, it, expect } from "vitest";
import {
  phoneSchema,
  addressSchema,
  customerDetailSchema,
  customerFormSchema,
} from "@/lib/validations/customer.schema";

// ============================================================================
// phoneSchema
// ============================================================================

describe("phoneSchema", () => {
  it("accepts a valid 10-digit mobile number", () => {
    const result = phoneSchema.safeParse({ number: "8096781234", type: "mobile" });
    expect(result.success).toBe(true);
  });

  it("accepts all valid phone types", () => {
    for (const type of ["mobile", "home", "work"] as const) {
      const result = phoneSchema.safeParse({ number: "8096781234", type });
      expect(result.success, `type "${type}" should be valid`).toBe(true);
    }
  });

  it("rejects a number with fewer than 10 digits", () => {
    const result = phoneSchema.safeParse({ number: "809123", type: "mobile" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/10 digits/i);
  });

  it("rejects a number with more than 10 digits", () => {
    const result = phoneSchema.safeParse({ number: "80967812345", type: "mobile" });
    expect(result.success).toBe(false);
  });

  it("rejects non-digit characters in number", () => {
    const result = phoneSchema.safeParse({ number: "809-678-12", type: "mobile" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid phone type", () => {
    const result = phoneSchema.safeParse({ number: "8096781234", type: "fax" });
    expect(result.success).toBe(false);
  });

  it("accepts optional country_area and extension", () => {
    const result = phoneSchema.safeParse({
      number: "8096781234",
      type: "work",
      country_area: "809",
      extension: "123",
    });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// addressSchema
// ============================================================================

describe("addressSchema", () => {
  const validAddress = {
    street: "Calle Duarte #45",
    city: "Santo Domingo",
    province: "Distrito Nacional",
    country: "Dominican Republic",
  };

  it("accepts a valid address", () => {
    const result = addressSchema.safeParse(validAddress);
    expect(result.success).toBe(true);
  });

  it("accepts an address with optional postal_code", () => {
    const result = addressSchema.safeParse({ ...validAddress, postal_code: "10101" });
    expect(result.success).toBe(true);
  });

  it("rejects missing street", () => {
    const { street: _, ...noStreet } = validAddress;
    const result = addressSchema.safeParse(noStreet);
    expect(result.success).toBe(false);
  });

  it("rejects an empty street string", () => {
    const result = addressSchema.safeParse({ ...validAddress, street: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/required/i);
  });

  it("rejects missing city", () => {
    const result = addressSchema.safeParse({ ...validAddress, city: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing country", () => {
    const result = addressSchema.safeParse({ ...validAddress, country: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/required/i);
  });
});

// ============================================================================
// customerDetailSchema
// ============================================================================

describe("customerDetailSchema", () => {
  const validDetail = {
    first_name: "Carlos",
    last_name: "Ramírez",
  };

  it("accepts minimal valid detail (name only)", () => {
    const result = customerDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it("accepts full detail payload", () => {
    const result = customerDetailSchema.safeParse({
      ...validDetail,
      email: "carlos@example.com",
      birthday: "1985-03-12",
      gender: "M",
      marital_status: "married",
    });
    expect(result.success).toBe(true);
  });

  it("rejects first_name shorter than 2 characters", () => {
    const result = customerDetailSchema.safeParse({ ...validDetail, first_name: "A" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/at least 2/i);
  });

  it("rejects an invalid email", () => {
    const result = customerDetailSchema.safeParse({ ...validDetail, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("accepts empty string email (treated as no email)", () => {
    const result = customerDetailSchema.safeParse({ ...validDetail, email: "" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid gender value", () => {
    const result = customerDetailSchema.safeParse({ ...validDetail, gender: "X" });
    expect(result.success).toBe(false);
  });

  it("accepts all valid gender values", () => {
    for (const gender of ["M", "F", "O"] as const) {
      const result = customerDetailSchema.safeParse({ ...validDetail, gender });
      expect(result.success, `gender "${gender}" should be valid`).toBe(true);
    }
  });

  it("rejects an invalid marital_status", () => {
    const result = customerDetailSchema.safeParse({ ...validDetail, marital_status: "complicated" });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// customerFormSchema (unified form schema)
// ============================================================================

describe("customerFormSchema", () => {
  const validForm = {
    is_referred: false,
    detail: {
      first_name: "Ana",
      last_name: "Martínez",
    },
    phones: [{ number: "8495678901", type: "mobile" }],
  };

  it("accepts a valid minimal form payload (create mode)", () => {
    const result = customerFormSchema.safeParse({
      NID: "00112345678",
      ...validForm,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a form without NID (edit mode — NID is optional)", () => {
    // NID is optional in the form schema — edit mode starts with empty string
    const result = customerFormSchema.safeParse(validForm);
    expect(result.success).toBe(true);
  });

  it("accepts NID as empty string (edit mode init state)", () => {
    const result = customerFormSchema.safeParse({ ...validForm, NID: "" });
    expect(result.success).toBe(true);
  });

  it("rejects NID that is not exactly 11 digits", () => {
    const result = customerFormSchema.safeParse({
      ...validForm,
      NID: "0011234",   // too short
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/11 digits/i);
  });

  it("requires at least one phone", () => {
    const result = customerFormSchema.safeParse({
      ...validForm,
      phones: [],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/at least one/i);
  });

  it("requires is_referred to be a boolean (not optional)", () => {
    // Omitting is_referred should fail
    const { is_referred: _, ...noRef } = validForm;
    const result = customerFormSchema.safeParse(noRef);
    expect(result.success).toBe(false);
  });

  it("accepts is_referred: true with a valid referred_by NID", () => {
    const result = customerFormSchema.safeParse({
      ...validForm,
      is_referred: true,
      referred_by: "00198765432",
    });
    expect(result.success).toBe(true);
  });

  it("rejects referred_by with non-11-digit value", () => {
    const result = customerFormSchema.safeParse({
      ...validForm,
      is_referred: true,
      referred_by: "123",   // too short
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional addresses array", () => {
    const result = customerFormSchema.safeParse({
      ...validForm,
      addresses: [
        {
          street: "Calle Duarte #45",
          city: "Santo Domingo",
          province: "Distrito Nacional",
          country: "Dominican Republic",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid address within the addresses array", () => {
    const result = customerFormSchema.safeParse({
      ...validForm,
      addresses: [
        {
          street: "",         // empty — fails min(1)
          city: "Santo Domingo",
          province: "DN",
          country: "Dominican Republic",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
