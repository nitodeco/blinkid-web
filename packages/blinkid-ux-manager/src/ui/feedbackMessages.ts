/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { BlinkIdUiStateKey } from "../core/blinkid-ui-state";
import { LocalizationStrings } from "./LocalizationContext";

export const feedbackMessages: Partial<
  Record<BlinkIdUiStateKey, keyof LocalizationStrings>
> = {
  SENSING_FRONT: "scan_the_front_side",
  SENSING_BACK: "scan_the_back_side",
  SIDE_CAPTURED: "flip_to_back_side",
  WRONG_SIDE: "flip_document",
  SCAN_BARCODE: "scan_the_barcode",
  // occlusion
  BLUR_DETECTED: "blur_detected",
  GLARE_DETECTED: "glare_detected",
  OCCLUDED: "occluded",
  // framing
  DOCUMENT_FRAMING_CAMERA_TOO_CLOSE: "move_farther",
  DOCUMENT_FRAMING_CAMERA_TOO_FAR: "move_closer",
  DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE: "document_too_close_to_edge",
  DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP: "camera_angle_too_steep",
  // lighting
  TOO_DARK: "too_dark",
  TOO_BRIGHT: "too_bright",
};
