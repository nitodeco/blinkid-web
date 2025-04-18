/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/**
 * Original: https://github.com/CezaryDanielNowak/CrossOriginWorker
 */

// TODO: use https://github.com/hexagon/proper-tags
import { stripIndents } from "common-tags";

const type = "application/javascript";

type Options = {
  skipSameOrigin?: boolean;
  useBlob?: boolean;
};

export const getCrossOriginWorkerURL = (
  originalWorkerUrl: string,
  _options: Options = {},
) => {
  const options = {
    skipSameOrigin: true,
    useBlob: true,

    ..._options,
  };

  if (
    options.skipSameOrigin &&
    new URL(originalWorkerUrl).origin === self.location.origin
  ) {
    // The same origin - Worker will run fine
    return Promise.resolve(originalWorkerUrl);
  }

  let signal: AbortSignal;

  try {
    // Setup the abort controller
    const controller = new AbortController();
    signal = controller.signal;

    const timeout = setTimeout(() => {
      controller.abort();
    }, 3000);

    const cleanup = () => {
      clearTimeout(timeout);
      controller.abort();
    };

    signal.addEventListener("abort", cleanup);
  } catch (error) {
    // just swallow the error
  }

  return new Promise<string>(
    (resolve, reject) =>
      void fetch(originalWorkerUrl, {
        // abort if the worker is not fetched in a reasonable time
        signal,
      })
        .then((res) => res.text())
        .then((codeString) => {
          const workerPath = new URL(originalWorkerUrl).href.split("/");
          workerPath.pop();

          // This needs to be removed if used in the worker context itself as
          // the global variables are already injected there!
          const importScriptsFix = stripIndents`
            const _importScripts = importScripts;
            const _fixImports = (url) => new URL(url, '${
              workerPath.join("/") + "/"
            }').href;
            importScripts = (...urls) => _importScripts(...urls.map(_fixImports));
          `;

          let finalURL = "";

          if (options.useBlob) {
            const blob = new Blob([importScriptsFix + codeString], { type });
            finalURL = URL.createObjectURL(blob);
          } else {
            finalURL =
              `data:${type},` +
              encodeURIComponent(importScriptsFix + codeString);
          }

          resolve(finalURL);
        })
        .catch(() => {
          reject(new Error(`Failed to fetch worker from ${originalWorkerUrl}`));
        }),
  );
};
