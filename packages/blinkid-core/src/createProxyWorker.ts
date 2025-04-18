/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { releaseProxy, wrap } from "comlink";
import type { BlinkIdWorkerProxy } from "@microblink/blinkid-worker";
import { getCrossOriginWorkerURL } from "./getCrossOriginWorkerURL";
import { oneLineTrim } from "common-tags";

/**
 * Creates a Comlink-proxied Web Worker
 *
 * @param resourcesLocation where the "resources" directory is placed, default
 * is `window.location.href`
 * @returns a Comlink-proxied instance of the Web Worker
 */
export const createProxyWorker = async (
  resourcesLocation: string = window.location.href,
) => {
  const workerUrl = await getCrossOriginWorkerURL(
    new URL("resources/blinkid-worker.js", resourcesLocation).toString(),
  );

  // Try to validate the worker file exists before creating the worker
  // Attempt to fetch the worker script to check if it exists
  const response = await fetch(workerUrl, { method: "HEAD" });
  const contentType = response.headers.get("content-type");

  const isJavascript = contentType?.includes("javascript");
  const isHtml = contentType?.includes("html");

  if (isHtml) {
    throw new Error(
      oneLineTrim`${workerUrl} resolved to a resource with the content type ${contentType}.
      This is likely an issue with the server configuration redirecting to an index.html file.
      Check that your resources are properly hosted`,
    );
  }

  if (!isJavascript) {
    throw new Error(`Worker file is not a JavaScript file: ${contentType}`);
  }

  if (!response.ok) {
    throw new Error(
      `Worker file not found or inaccessible: ${response.status} ${response.statusText}`,
    );
  }

  const worker = new Worker(workerUrl, {
    type: "module",
  });

  worker.onerror = (e) => {
    console.error("Worker error:", e);
    proxyWorker[releaseProxy]();
  };

  const proxyWorker = wrap<BlinkIdWorkerProxy>(worker);

  return proxyWorker;
};

export type RemoteWorker = ReturnType<typeof createProxyWorker>;
