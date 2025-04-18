/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import {
  loadBlinkIdCore,
  ProgressStatusCallback,
} from "@microblink/blinkid-core";

const progressCallback: ProgressStatusCallback = (progress) => {
  console.log(progress);
};

const blinkIdCore = await loadBlinkIdCore(
  {
    licenseKey: import.meta.env.VITE_LICENCE_KEY,
    // resourcesLocation: "https://localhost:3020",
    // wasmVariant: "advanced",
  },
  progressCallback,
);

const session = await blinkIdCore.createBlinkIdScanningSession();

const frameResult = await session.process(new ImageData(1920, 1080));
console.log("frameResult", frameResult);

const result = await session.getResult();
console.log("result", result);
