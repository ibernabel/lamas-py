"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface TelemetryData {
  clipboard_paste_detected: boolean;
  keystroke_latency_ms: number;
  device_fingerprint: string;
  step_timings_sec: Record<string, number>;
}

function generateSimpleFingerprint(): string {
  if (typeof window === "undefined") return "fp_server_side";
  const userAgent = navigator.userAgent || "";
  const screenRes = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const language = navigator.language || "";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  
  const rawStr = `${userAgent}|${screenRes}|${language}|${timeZone}`;
  let hash = 0;
  for (let i = 0; i < rawStr.length; i++) {
    const char = rawStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

export function useFormTelemetry() {
  const [fingerprint, setFingerprint] = useState<string>("");
  const [pasteDetected, setPasteDetected] = useState<boolean>(false);
  const keystrokeTimesRef = useRef<number[]>([]);
  const lastKeystrokeRef = useRef<number | null>(null);
  const stepStartTimesRef = useRef<Record<string, number>>({});
  const stepTimingsRef = useRef<Record<string, number>>({});
  const activeStepRef = useRef<string>("step1");

  useEffect(() => {
    setFingerprint(generateSimpleFingerprint());
    stepStartTimesRef.current["step1"] = Date.now();

    const handleKeyDown = () => {
      const now = Date.now();
      if (lastKeystrokeRef.current !== null) {
        const diff = now - lastKeystrokeRef.current;
        if (diff > 10 && diff < 3000) {
          keystrokeTimesRef.current.push(diff);
        }
      }
      lastKeystrokeRef.current = now;
    };

    const handlePaste = () => {
      setPasteDetected(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const recordStepTransition = useCallback((fromStepKey: string, toStepKey: string) => {
    const now = Date.now();
    const startTime = stepStartTimesRef.current[fromStepKey] || now;
    const elapsedSec = Math.max(1, Math.round((now - startTime) / 1000));
    
    stepTimingsRef.current[fromStepKey] = (stepTimingsRef.current[fromStepKey] || 0) + elapsedSec;
    stepStartTimesRef.current[toStepKey] = now;
    activeStepRef.current = toStepKey;
  }, []);

  const getTelemetryPayload = useCallback((): TelemetryData => {
    // Record current active step timing before returning
    const now = Date.now();
    const activeKey = activeStepRef.current;
    const startTime = stepStartTimesRef.current[activeKey] || now;
    const currentElapsed = Math.max(1, Math.round((now - startTime) / 1000));
    
    const finalStepTimings = {
      ...stepTimingsRef.current,
      [activeKey]: (stepTimingsRef.current[activeKey] || 0) + currentElapsed,
    };

    const latencies = keystrokeTimesRef.current;
    const avgLatency = latencies.length > 0
      ? Number((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1))
      : 150.0;

    return {
      clipboard_paste_detected: pasteDetected,
      keystroke_latency_ms: avgLatency,
      device_fingerprint: fingerprint || generateSimpleFingerprint(),
      step_timings_sec: finalStepTimings,
    };
  }, [fingerprint, pasteDetected]);

  return {
    fingerprint,
    pasteDetected,
    recordStepTransition,
    getTelemetryPayload,
  };
}
