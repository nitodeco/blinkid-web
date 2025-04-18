/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/** Represents the status of the document detection process. */
export type DetectionStatus =
  /** Detection has failed. */
  | "failed"
  /** Document has been detected. */
  | "success"
  /** Document has been detected but the camera is too far from the document. */
  | "camera-too-far"
  /** Document has been detected but the camera is too close to the document. */
  | "camera-too-close"
  /** Document has been detected but the camera’s angle is too steep. */
  | "camera-angle-too-steep"
  /**
   * Document has been detected but the document is too close to the camera
   * edge.
   */
  | "document-too-close-to-camera-edge"
  /** Only part of the document is visible. */
  | "document-partially-visible";
