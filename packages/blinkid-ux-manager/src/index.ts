/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

export * from "./core/blinkid-ui-state";
export * from "./core/BlinkIdUxManager";
export * from "./ui/createBlinkIdFeedbackUi";
export type {
  LocaleRecord,
  LocalizationStrings,
} from "./ui/LocalizationContext";
export type { DocumentClassFilter } from "./core/DocumentClassFilter";

export type * from "@microblink/feedback-stabilizer";
export type { BlinkIdProcessingError } from "./core/BlinkIdProcessingError";

// https://newsletter.daishikato.com/p/detecting-dual-module-issues-in-jotai
const testSymbol = Symbol();

declare global {
  /* eslint-disable no-var */
  var __BLINKID_UX_MANAGER__: typeof testSymbol;
}

globalThis.__BLINKID_UX_MANAGER__ ||= testSymbol;
if (globalThis.__BLINKID_UX_MANAGER__ !== testSymbol) {
  console.warn(
    "Detected multiple instances of @microblink/blinkid-ux-manager. This can lead to unexpected behavior.",
  );
}
