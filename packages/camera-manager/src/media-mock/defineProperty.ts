/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/**
 * Taken from
 * https://github.com/eatsjobs/media-mock/blob/main/lib/defineProperty.ts
 * @returns a function that reverts the property to its original value
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineProperty<T extends Record<string | symbol | number, any>>(
  targetObject: T,
  property: keyof T,
  newValue: unknown,
): () => void {
  const original = targetObject[property];
  Object.defineProperty(targetObject, property, {
    writable: true,
    configurable: true,
    value: newValue,
  });

  return () => {
    Object.defineProperty(targetObject, property, {
      writable: true,
      configurable: true,
      value: original,
    });
  };
}
