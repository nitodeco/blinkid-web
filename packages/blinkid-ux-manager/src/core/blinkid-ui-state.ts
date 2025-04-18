/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import {
  InputImageAnalysisResult,
  ResultCompleteness,
  ScanningSettings,
} from "@microblink/blinkid-core";
import { UiState } from "@microblink/feedback-stabilizer";
import { match, P } from "ts-pattern";

export type BlinkIdReticleType =
  | "searching"
  | "processing"
  | "error"
  | "done"
  | "flip";

export type BlinkIdUiStateKey =
  | "SIDE_CAPTURED"
  | "DOCUMENT_CAPTURED"
  | "SENSING_FRONT"
  | "SENSING_BACK"
  | "DOCUMENT_FRAMING_CAMERA_TOO_FAR"
  | "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE"
  | "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP"
  | "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE"
  | "BLUR_DETECTED"
  | "GLARE_DETECTED"
  | "TOO_DARK"
  | "TOO_BRIGHT"
  | "OCCLUDED"
  | "UNSUPPORTED_DOCUMENT"
  | "SCAN_BARCODE"
  | "WRONG_SIDE";

/**
 * Extended UI state for BlinkID.
 */

export type BlinkIdUiStateMap = {
  [K in BlinkIdUiStateKey]: UiState & {
    key: K;
    reticleType: BlinkIdReticleType;
  };
};

export type BlinkIdUiState = BlinkIdUiStateMap[keyof BlinkIdUiStateMap];

export const blinkIdUiStateMap: BlinkIdUiStateMap = {
  SENSING_FRONT: {
    key: "SENSING_FRONT",
    reticleType: "searching",
    minDuration: 1000,
  },
  SENSING_BACK: {
    key: "SENSING_BACK",
    reticleType: "searching",
    minDuration: 1000,
  },
  SCAN_BARCODE: {
    key: "SCAN_BARCODE",
    reticleType: "processing",
    minDuration: 1000,
  },
  SIDE_CAPTURED: {
    key: "SIDE_CAPTURED",
    reticleType: "flip",
    minDuration: 2000,
    singleEmit: true,
  },
  DOCUMENT_CAPTURED: {
    key: "DOCUMENT_CAPTURED",
    reticleType: "done",
    minDuration: 1000,
    singleEmit: true,
  },
  BLUR_DETECTED: {
    key: "BLUR_DETECTED",
    reticleType: "error",
    minDuration: 1500,
  },
  GLARE_DETECTED: {
    key: "GLARE_DETECTED",
    reticleType: "error",
    minDuration: 1500,
  },

  OCCLUDED: {
    key: "OCCLUDED",
    reticleType: "error",
    minDuration: 1500,
  },
  WRONG_SIDE: {
    key: "WRONG_SIDE",
    reticleType: "error",
    minDuration: 1500,
  },
  TOO_DARK: {
    key: "TOO_DARK",
    reticleType: "error",
    minDuration: 1500,
  },
  TOO_BRIGHT: {
    key: "TOO_BRIGHT",
    reticleType: "error",
    minDuration: 1500,
  },
  DOCUMENT_FRAMING_CAMERA_TOO_FAR: {
    key: "DOCUMENT_FRAMING_CAMERA_TOO_FAR",
    reticleType: "error",
    minDuration: 1500,
  },
  DOCUMENT_FRAMING_CAMERA_TOO_CLOSE: {
    key: "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
    reticleType: "error",
    minDuration: 1500,
  },
  DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP: {
    key: "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
    reticleType: "error",
    minDuration: 1500,
  },
  DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE: {
    key: "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
    reticleType: "error",
    minDuration: 1500,
  },
  UNSUPPORTED_DOCUMENT: {
    key: "UNSUPPORTED_DOCUMENT",
    reticleType: "error",
    minDuration: 1500,
  },
} as const;

export type PartialProcessResult = {
  inputImageAnalysisResult: Partial<InputImageAnalysisResult>;
  resultCompleteness: Partial<ResultCompleteness>;
};

export function getUiStateKey(
  frameProcessResult: PartialProcessResult,
  settings?: Partial<ScanningSettings>,
) {
  return (
    match<PartialProcessResult, BlinkIdUiStateKey>(frameProcessResult)
      // Success states
      .with(
        {
          resultCompleteness: {
            scanningStatus: "document-scanned",
          },
        },
        () => "DOCUMENT_CAPTURED",
      )

      // unsupported document
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "unsupported-document",
          },
        },
        () => "UNSUPPORTED_DOCUMENT",
      )

      .with(
        {
          resultCompleteness: {
            scanningStatus: "side-scanned",
          },
        },
        () => "SIDE_CAPTURED",
      )

      // framing
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "camera-angle-too-steep",
          },
        },
        () => "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "camera-too-close",
          },
        },
        () => "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "camera-too-far",
          },
        },
        () => "DOCUMENT_FRAMING_CAMERA_TOO_FAR",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "document-too-close-to-camera-edge",
          },
        },
        () => "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
      )

      // lighting
      // .with(
      //   {
      //     inputImageAnalysisResult: {
      //       documentLightingStatus: P.when(
      //         (status) =>
      //           status === "too-bright" &&
      //           settings?.skipImagesWithInadequateLightingConditions,
      //       ),
      //     },
      //   },
      //   () => "TOO_BRIGHT",
      // )
      // .with(
      //   {
      //     inputImageAnalysisResult: {
      //       documentLightingStatus: P.when(
      //         (status) =>
      //           status === "too-dark" &&
      //           settings?.skipImagesWithInadequateLightingConditions,
      //       ),
      //     },
      //   },
      //   () => "TOO_DARK",
      // )

      // glare
      .with(
        {
          inputImageAnalysisResult: {
            glareDetectionStatus: P.when(
              (status) =>
                status === "detected" && settings?.skipImagesWithGlare,
            ),
          },
        },
        () => "GLARE_DETECTED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            documentDetectionStatus: "document-partially-visible",
          },
        },
        () => "OCCLUDED",
      )
      // .with(
      //   {
      //     inputImageAnalysisResult: {
      //       documentHandOcclusionStatus: P.when(
      //         (status) =>
      //           status === "detected" && settings?.skipImagesOccludedByHand,
      //       ),
      //     },
      //   },
      //   () => "OCCLUDED",
      // )
      .with(
        {
          inputImageAnalysisResult: {
            missingMandatoryFields: P.when(
              (arr) => Array.isArray(arr) && arr.length > 0,
            ),
          },
        },
        () => "OCCLUDED",
      )
      // technically the same as the previous case
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "mandatory-field-missing",
          },
        },
        () => "OCCLUDED",
      )
      // TODO: check if this is correct
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "invalid-characters-found",
          },
        },
        () => "OCCLUDED",
      )
      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "mrz-parsing-failed",
          },
        },
        () => "OCCLUDED",
      )

      .with(
        {
          inputImageAnalysisResult: {
            blurDetectionStatus: P.when(
              (status) => status === "detected" && settings?.skipImagesWithBlur,
            ),
          },
        },
        () => "BLUR_DETECTED",
      )

      .with(
        {
          inputImageAnalysisResult: {
            processingStatus: "scanning-wrong-side",
          },
        },
        () => "WRONG_SIDE",
      )

      // scan front / back / barcode
      .with(
        {
          resultCompleteness: {
            scanningStatus: "scanning-barcode-in-progress",
          },
        },
        () => "SCAN_BARCODE",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "first",
          },
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
        },
        () => "SENSING_FRONT",
      )
      .with(
        {
          inputImageAnalysisResult: {
            scanningSide: "second",
          },
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
        },
        () => "SENSING_BACK",
      )

      // fallback
      .otherwise(() => "SENSING_FRONT")
  );
}
