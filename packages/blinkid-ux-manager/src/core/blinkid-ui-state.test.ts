/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { expect, test, describe } from "vitest";
import {
  BlinkIdUiStateKey,
  getUiStateKey,
  PartialProcessResult,
} from "./blinkid-ui-state";
import {
  DetectionStatus,
  ImageAnalysisLightingStatus,
  ScanningSettings,
  ScanningSide,
} from "@microblink/blinkid-core";
import { merge } from "merge-anything";

// todo export this from the core or somewhere else so it's consumable cross packages
export const defaultScanningSettings: ScanningSettings = {
  allowUncertainFrontSideScan: false,
  blurDetectionLevel: "mid",
  glareDetectionLevel: "mid",
  tiltDetectionLevel: "mid",
  skipImagesWithBlur: true,
  skipImagesWithGlare: true,
  skipImagesOccludedByHand: false,
  skipImagesWithInadequateLightingConditions: false,
  combineResultsFromMultipleInputImages: true,
  croppedImageSettings: {
    dotsPerInch: 250,
    extensionFactor: 0,
    returnDocumentImage: false,
    returnFaceImage: false,
    returnSignatureImage: false,
  },
  customDocumentAnonymizationSettings: [],
  customDocumentRules: [],
  enableBarcodeScanOnly: false,
  enableCharacterValidation: true,
  inputImageMargin: 0,
  maxAllowedMismatchesPerField: 0,
  recognitionModeFilter: {
    enableBarcodeId: true,
    enableFullDocumentRecognition: true,
    enableMrzId: true,
    enableMrzPassport: true,
    enableMrzVisa: true,
    enablePhotoId: true,
  },
  returnInputImages: false,
  scanCroppedDocumentImage: false,
  scanPassportDataPageOnly: false,
  scanUnsupportedBack: false,
  anonymizationMode: undefined,
};

const getMergedSettings = (
  overrides: Partial<ScanningSettings> = {},
): ScanningSettings => {
  return merge(defaultScanningSettings, overrides);
};

const createProcessResult = (overrides = {}): PartialProcessResult => {
  return merge(
    {
      inputImageAnalysisResult: {},
      resultCompleteness: {},
    },
    overrides,
  );
};

describe("getUiStateKey", () => {
  describe("Document Capture States", () => {
    test("should return DOCUMENT_CAPTURED when document is fully scanned", () => {
      const processResult = createProcessResult({
        resultCompleteness: { scanningStatus: "document-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should return SIDE_CAPTURED when one side is scanned", () => {
      const processResult = createProcessResult({
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("SIDE_CAPTURED");
    });

    test("should return SCAN_BARCODE when scanning barcode is in progress", () => {
      const processResult = createProcessResult({
        resultCompleteness: { scanningStatus: "scanning-barcode-in-progress" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("SCAN_BARCODE");
    });
  });

  describe("Document Framing States", () => {
    test.each<{ status: DetectionStatus; expected: BlinkIdUiStateKey }>([
      {
        status: "camera-too-close",
        expected: "DOCUMENT_FRAMING_CAMERA_TOO_CLOSE",
      },
      { status: "camera-too-far", expected: "DOCUMENT_FRAMING_CAMERA_TOO_FAR" },
      {
        status: "camera-angle-too-steep",
        expected: "DOCUMENT_FRAMING_CAMERA_ANGLE_TOO_STEEP",
      },
      {
        status: "document-too-close-to-camera-edge",
        expected: "DOCUMENT_TOO_CLOSE_TO_FRAME_EDGE",
      },
    ])(
      "should return $expected when document detection status is $status",
      ({ status, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: { documentDetectionStatus: status },
        });
        const settings = getMergedSettings();

        const result = getUiStateKey(processResult, settings);

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );
  });

  describe("Image Quality States", () => {
    describe("Blur Detection", () => {
      test.each<{
        skipImagesWithBlur: boolean;
        expected: BlinkIdUiStateKey;
      }>([
        { skipImagesWithBlur: true, expected: "BLUR_DETECTED" },
        { skipImagesWithBlur: false, expected: "SENSING_FRONT" },
      ])(
        "should return $expected when blur is detected and skipImagesWithBlur is $skipImagesWithBlur",
        ({ skipImagesWithBlur, expected }) => {
          const processResult = createProcessResult({
            inputImageAnalysisResult: { blurDetectionStatus: "detected" },
          });
          const settings = getMergedSettings({ skipImagesWithBlur });

          const result = getUiStateKey(processResult, settings);

          expect(result).toBe<BlinkIdUiStateKey>(expected);
        },
      );
    });

    describe("Glare Detection", () => {
      test.each<{
        skipImagesWithGlare: boolean;
        expected: BlinkIdUiStateKey;
      }>([
        { skipImagesWithGlare: true, expected: "GLARE_DETECTED" },
        { skipImagesWithGlare: false, expected: "SENSING_FRONT" },
      ])(
        "should return $expected when glare is detected and skipImagesWithGlare is $skipImagesWithGlare",
        ({ skipImagesWithGlare, expected }) => {
          const processResult = createProcessResult({
            inputImageAnalysisResult: { glareDetectionStatus: "detected" },
          });
          const settings = getMergedSettings({ skipImagesWithGlare });

          const result = getUiStateKey(processResult, settings);

          expect(result).toBe<BlinkIdUiStateKey>(expected);
        },
      );
    });

    describe("Blur and Glare combined", () => {
      test("should return SENSING_FRONT when both blur and glare are detected but skip settings are disabled", () => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            blurDetectionStatus: "detected",
            glareDetectionStatus: "detected",
          },
        });
        const settings = getMergedSettings({
          skipImagesWithBlur: false,
          skipImagesWithGlare: false,
        });

        const result = getUiStateKey(processResult, settings);

        expect(result).toBe<BlinkIdUiStateKey>("SENSING_FRONT");
      });
    });

    describe.skip("Lighting Conditions", () => {
      test.each<{
        status: ImageAnalysisLightingStatus;
        expected: BlinkIdUiStateKey;
        skipImagesWithInadequateLightingConditions: boolean;
      }>([
        {
          status: "too-dark",
          expected: "TOO_DARK",
          skipImagesWithInadequateLightingConditions: true,
        },
        {
          status: "too-dark",
          expected: "SENSING_FRONT",
          skipImagesWithInadequateLightingConditions: false,
        },
        {
          status: "too-bright",
          expected: "TOO_BRIGHT",
          skipImagesWithInadequateLightingConditions: true,
        },
        {
          status: "too-bright",
          expected: "SENSING_FRONT",
          skipImagesWithInadequateLightingConditions: false,
        },
      ])(
        "should return $expected when lighting status is $status and skipImagesWithInadequateLightingConditions is $enabled",
        ({ status, expected, skipImagesWithInadequateLightingConditions }) => {
          const processResult = createProcessResult({
            inputImageAnalysisResult: { documentLightingStatus: status },
          });
          const settings = getMergedSettings({
            skipImagesWithInadequateLightingConditions:
              skipImagesWithInadequateLightingConditions,
          });

          const result = getUiStateKey(processResult, settings);

          expect(result).toBe<BlinkIdUiStateKey>(expected);
        },
      );
    });
  });

  describe("Occlusion States", () => {
    test("should return OCCLUDED when document is partially visible", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentDetectionStatus: "document-partially-visible",
        },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("OCCLUDED");
    });

    test.skip.each<{
      skipImagesOccludedByHand: boolean;
      expected: BlinkIdUiStateKey;
    }>([
      { skipImagesOccludedByHand: true, expected: "OCCLUDED" },
      { skipImagesOccludedByHand: false, expected: "SENSING_FRONT" },
    ])(
      "should return $expected when document is occluded by hand and skipImagesOccludedByHand is $skipImagesOccludedByHand",
      ({ skipImagesOccludedByHand, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: { documentHandOcclusionStatus: "detected" },
        });
        const settings = getMergedSettings({ skipImagesOccludedByHand });

        const result = getUiStateKey(processResult, settings);

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );

    test.each<{
      missingMandatoryFields: string[];
      expected: BlinkIdUiStateKey;
    }>([
      {
        missingMandatoryFields: ["firstName", "lastName"],
        expected: "OCCLUDED",
      },
      { missingMandatoryFields: [], expected: "SENSING_FRONT" },
    ])(
      "should return $expected when missingMandatoryFields is $missingMandatoryFields",
      ({ missingMandatoryFields, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: { missingMandatoryFields },
        });
        const settings = getMergedSettings();

        const result = getUiStateKey(processResult, settings);

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );

    test("should handle multiple occlusion conditions simultaneously", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentHandOcclusionStatus: "detected",
          documentDetectionStatus: "document-partially-visible",
          missingMandatoryFields: ["firstName", "lastName"],
        },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("OCCLUDED");
    });
  });

  describe("Document Side Detection", () => {
    test.each([{ scanningSide: "first" }, { scanningSide: "second" }])(
      "should return WRONG_SIDE when scanning wrong side ($scanningSide)",
      ({ scanningSide }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            scanningSide,
            processingStatus: "scanning-wrong-side",
          },
        });
        const settings = getMergedSettings();

        const result = getUiStateKey(processResult, settings);

        expect(result).toBe<BlinkIdUiStateKey>("WRONG_SIDE");
      },
    );

    test.each<{
      scanningSide: ScanningSide;
      expected: BlinkIdUiStateKey;
    }>([
      { scanningSide: "first", expected: "SENSING_FRONT" },
      { scanningSide: "second", expected: "SENSING_BACK" },
    ])(
      "should return $expected when sensing $scanningSide side with failed detection",
      ({ scanningSide, expected }) => {
        const processResult = createProcessResult({
          inputImageAnalysisResult: {
            scanningSide,
            documentDetectionStatus: "failed",
          },
          resultCompleteness: {
            scanningStatus: "scanning-side-in-progress",
          },
        });
        const settings = getMergedSettings();

        const result = getUiStateKey(processResult, settings);

        expect(result).toBe<BlinkIdUiStateKey>(expected);
      },
    );
  });

  describe("Special States", () => {
    test("should return UNSUPPORTED_DOCUMENT when document is unsupported", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { processingStatus: "unsupported-document" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("UNSUPPORTED_DOCUMENT");
    });

    test("should return SENSING_FRONT as fallback when no specific conditions are met", () => {
      const processResult = createProcessResult();
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("SENSING_FRONT");
    });

    test.skip("should return OCCLUDED when document hand occlusion is detected", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentHandOcclusionStatus: "detected",
        },
      });
      const settings = getMergedSettings({
        skipImagesOccludedByHand: true,
      });

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("OCCLUDED");
    });
  });

  describe("Priority Rules", () => {
    test("should prioritize DOCUMENT_CAPTURED over framing issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { documentDetectionStatus: "camera-too-far" },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should prioritize DOCUMENT_CAPTURED over occlusion issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { documentHandOcclusionStatus: "detected" },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should prioritize DOCUMENT_CAPTURED over blur issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { blurDetectionStatus: "detected" },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });

    test("should prioritize SIDE_CAPTURED over blur detection", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { blurDetectionStatus: "detected" },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("SIDE_CAPTURED");
    });

    test("should prioritize SIDE_CAPTURED over glare detection", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { glareDetectionStatus: "detected" },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      const settings = getMergedSettings({ skipImagesWithGlare: true });

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("SIDE_CAPTURED");
    });

    test("should prioritize SIDE_CAPTURED over wrong side detection", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { processingStatus: "scanning-wrong-side" },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("SIDE_CAPTURED");
    });

    test("should prioritize UNSUPPORTED_DOCUMENT over side captured", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: { processingStatus: "unsupported-document" },
        resultCompleteness: { scanningStatus: "side-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("UNSUPPORTED_DOCUMENT");
    });

    test.skip("should prioritize lighting issues over GLARE_DETECTED", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          documentLightingStatus: "too-dark",
          glareDetectionStatus: "detected",
        },
      });
      const settings = getMergedSettings({
        skipImagesWithGlare: true,
        skipImagesWithInadequateLightingConditions: true,
      });

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("TOO_DARK");
    });

    test("should prioritize GLARE_DETECTED over BLUR_DETECTED when both are detected", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          blurDetectionStatus: "detected",
          glareDetectionStatus: "detected",
        },
      });
      const settings = getMergedSettings({
        skipImagesWithBlur: true,
        skipImagesWithGlare: true,
      });

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("GLARE_DETECTED");
    });

    test("should prioritize DOCUMENT_CAPTURED over all other issues", () => {
      const processResult = createProcessResult({
        inputImageAnalysisResult: {
          blurDetectionStatus: "detected",
          glareDetectionStatus: "detected",
          documentHandOcclusionStatus: "detected",
          documentDetectionStatus: "camera-too-far",
          processingStatus: "scanning-wrong-side",
          documentLightingStatus: "too-dark",
        },
        resultCompleteness: { scanningStatus: "document-scanned" },
      });
      const settings = getMergedSettings();

      const result = getUiStateKey(processResult, settings);

      expect(result).toBe<BlinkIdUiStateKey>("DOCUMENT_CAPTURED");
    });
  });
});
