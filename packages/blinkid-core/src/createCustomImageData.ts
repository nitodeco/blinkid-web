/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/**
 * fix for postmessage performance
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1439768&q=&can=4
 */
export function createCustomImageData(imageData: ImageData) {
  const customImageData = {
    data: imageData.data,
    width: imageData.width,
    height: imageData.height,
    colorSpace: imageData.colorSpace,
  } satisfies ImageData;

  return customImageData;
}
