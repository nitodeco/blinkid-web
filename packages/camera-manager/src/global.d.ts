/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/*
  Augments global types for the Image Capture API by adding
  missing types and properties.
  https://www.w3.org/TR/image-capture
  https://www.w3.org/TR/mediacapture-streams/
 */

type FocusMode = "none" | "manual" | "single-shot" | "continuous";
type ExposureMode = "continuous" | "manual";

/**
 * Partial on iOS Safari
 */
type SteppedRange = Partial<{ min: number; max: number; step: number }>;

declare global {
  interface MediaTrackCapabilities {
    torch?: MediaTrackSettings["torch"];
    focusMode?: FocusMode[];
    colorTemperature?: SteppedRange;
    exposureCompensation?: SteppedRange;
    exposureMode?: ExposureMode[];
    exposureTime?: SteppedRange;
    focusDistance?: SteppedRange;
    iso?: SteppedRange;
    whiteBalanceMode?: string[];
    zoom?: SteppedRange;
    resizeMode?: string[];
    powerEfficient?: boolean[];
  }

  interface MediaTrackSettings {
    torch?: boolean;
    focusMode?: FocusMode;
    colorTemperature?: number;
    exposureCompensation?: number;
    exposureMode?: ExposureMode;
    exposureTime?: number;
    focusDistance?: number;
    iso?: number;
    whiteBalanceMode?: string;
    zoom?: number;
    resizeMode?: string;
    powerEfficient?: boolean;
  }

  /**
   * So far only used to apply torch?
   */
  interface MediaTrackConstraintSet {
    torch?: MediaTrackSettings["torch"];
    focusMode?: FocusMode[];
  }

  interface MediaTrackSupportedConstraints {
    torch?: boolean;
    volume?: boolean;
    whiteBalanceMode?: boolean;
    zoom?: boolean;
    focusMode?: FocusMode[];
  }

  interface Window {
    __mbCameraManagerCssCode?: string;
  }
}

export {};
