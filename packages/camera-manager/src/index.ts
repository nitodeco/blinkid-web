/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import "rvfc-polyfill";

export * from "./core/cameraManagerStore";
export * from "./core/Camera";
export * from "./core/CameraManager";
export * from "./core/VideoFrameProcessor";

export * from "./ui/createCameraManagerUi";
export { cameraUiRefStore } from "./ui/zustandRefStore";
export type { CameraUiRefs } from "./ui/zustandRefStore";
export type {
  CameraUiLocalizationStrings,
  CameraUiLocaleRecord,
} from "./ui/LocalizationContext";

// https://newsletter.daishikato.com/p/detecting-dual-module-issues-in-jotai
const testSymbol = Symbol();

declare global {
  /* eslint-disable no-var */
  var __CAMERA_MANAGER__: typeof testSymbol;
}

globalThis.__CAMERA_MANAGER__ ||= testSymbol;
if (globalThis.__CAMERA_MANAGER__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/camera-manager. This can lead to unexpected behavior.",
  );
}
