/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

export type RequireAtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export function getKeyWithHighestValue<TObj extends Record<string, number>>(
  obj: TObj,
): keyof TObj {
  const keys = Object.keys(obj);

  if (keys.length === 0) {
    throw new Error("No members in object!");
  }
  // set default
  let maxKey = keys[0];
  let maxValue = -Infinity;

  for (const [key, value] of Object.entries(obj)) {
    if (value > maxValue) {
      maxValue = value;
      maxKey = key;
    }
  }

  return maxKey;
}

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
