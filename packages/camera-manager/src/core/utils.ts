/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

export function getAverage(arr: number[]) {
  return arr.reduce((p, c) => p + c, 0) / arr.length;
}

export const asError = (thrown: unknown): Error => {
  if (thrown instanceof Error) return thrown;
  try {
    return new Error(JSON.stringify(thrown));
  } catch {
    // fallback in case there's an error stringifying.
    // for example, due to circular references.
    return new Error(String(thrown));
  }
};

export function getKeyWithHighestValue(map: Map<string, number>) {
  let maxKey: string | null = null;
  let maxValue = -Infinity;

  map.forEach((value, key) => {
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  });

  return maxKey;
}
