/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import type {
  BlinkIdWorkerInitSettings,
  BlinkIdWorkerProxy,
  ProgressStatusCallback,
} from "@microblink/blinkid-worker";
import type { SetOptional, Simplify } from "type-fest";
import { createProxyWorker } from "./createProxyWorker";
import { getUserId } from "./getUserId";
import { proxy, Remote } from "comlink";
import { defaultSessionSettings } from "./defaultSessionSettings";

// User ID is optional outside the worker scope
export type BlinkIdInitSettings = SetOptional<
  BlinkIdWorkerInitSettings,
  "userId" | "useLightweightBuild"
>;

export type BlinkIdCore = Simplify<Remote<BlinkIdWorkerProxy>>;

/**
 * Creates a BlinkID worker and initializes it with the provided settings.
 *
 * @param {BlinkIdInitSettings} settings
 * @param {ProgressStatusCallback} progressCallback - Callback function used to track the progress of resource downloads (e.g., WASM and data files). It receives a DownloadProgress object, which contains details like the number of bytes loaded, the total content length, and the percentage of progress.
 */
export async function loadBlinkIdCore(
  settings: BlinkIdInitSettings,
  progressCallback?: ProgressStatusCallback,
): Promise<BlinkIdCore> {
  const remoteWorker = await createProxyWorker(settings.resourcesLocation);

  if (!settings.userId) {
    settings.userId = getUserId();
  }

  if (!settings.resourcesLocation) {
    settings.resourcesLocation = window.location.href;
  }

  if (settings.useLightweightBuild === undefined) {
    // use only on desktop devices
    settings.useLightweightBuild =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
  }

  const proxyProgressCallback = progressCallback
    ? proxy(progressCallback)
    : undefined;

  try {
    // we added the `userid` to the settings if not provided, so this assertion is safe
    await remoteWorker.initBlinkId(
      settings as BlinkIdWorkerInitSettings,
      defaultSessionSettings,
      proxyProgressCallback,
    );

    return remoteWorker;
  } catch (error) {
    throw new Error("Failed to initialize BlinkID", {
      cause: error,
    });
  }
}
