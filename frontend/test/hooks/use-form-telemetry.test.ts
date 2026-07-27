import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFormTelemetry } from "../../hooks/use-form-telemetry";

describe("useFormTelemetry", () => {
  it("should initialize device fingerprint and default values", () => {
    const { result } = renderHook(() => useFormTelemetry());
    expect(result.current.fingerprint).toBeDefined();
    expect(typeof result.current.fingerprint).toBe("string");
    expect(result.current.pasteDetected).toBe(false);

    const payload = result.current.getTelemetryPayload();
    expect(payload.clipboard_paste_detected).toBe(false);
    expect(payload.device_fingerprint).toBeDefined();
    expect(payload.step_timings_sec).toHaveProperty("step1");
  });

  it("should record step transitions accurately", () => {
    const { result } = renderHook(() => useFormTelemetry());

    act(() => {
      result.current.recordStepTransition("step1", "step2");
    });

    const payload = result.current.getTelemetryPayload();
    expect(payload.step_timings_sec.step1).toBeGreaterThanOrEqual(1);
    expect(payload.step_timings_sec).toHaveProperty("step2");
  });
});
