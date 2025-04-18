/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { EmbindObject } from "../emscripten";
import { BlinkIdProcessResult } from "./BlinkIdProcessResult";
import { BlinkIdScanningResult } from "./BlinkIdScanningResult";
import { BlinkIdSessionError } from "./BlinkIdSessionError";

/** Represents the scanning session for BlinkID */
export type BlinkIdScanningSession = EmbindObject<{
  /**
   * Resets the scanning session to initial state
   *
   * @returns Void if successful, SessionError if failed
   */
  reset: () => void | BlinkIdSessionError;

  /**
   * Processes the input camera frame
   *
   * @param image The frame to process
   */
  process: (image: ImageData) => BlinkIdProcessResult | BlinkIdSessionError;

  /** Returns the {@link BlinkIdScanningResult} */
  getResult: () => BlinkIdScanningResult;
}>;
