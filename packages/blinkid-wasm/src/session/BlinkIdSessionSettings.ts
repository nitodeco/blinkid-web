/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { InputImageSource } from "./InputImageSource";
import { ScanningMode } from "./ScanningMode";
import { ScanningSettings } from "../settings";

/**
 * Represents the configuration settings for a scanning session.
 *
 * This structure holds the settings related to the resources initialization,
 * input image source, scanning mode, and specific scanning configurations that
 * define how the scanning session should behave.
 */
export type BlinkIdSessionSettings = {
  /**
   * The type of image source for the scanning session.
   *
   * Defines whether the images are sourced from a video stream or a single
   * photo, as defined by {@link InputImageSource}. The default is set to
   * `video`.
   */
  inputImageSource: InputImageSource;

  /**
   * The scanning mode to be used during the scanning session.
   *
   * Specifies whether the scanning is for a single side of a document or
   * multiple sides, as defined in {@link ScanningMode}. The default is set to
   * `automatic`, which automatically determines the number of sides to scan.
   */
  scanningMode: ScanningMode;

  /**
   * The specific scanning settings for the scanning session.
   *
   * Defines various parameters that control the scanning process.
   */
  scanningSettings: ScanningSettings;
};
