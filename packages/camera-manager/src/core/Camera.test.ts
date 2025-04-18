/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { expect, test } from "vitest";
import { createInputDeviceInfo } from "../media-mock/createInputDeviceInfo";
import { Camera } from "./Camera";

test("Front label is applied correctly", () => {
  const camera = new Camera(
    createInputDeviceInfo({
      mockCapabilities: {
        facingMode: ["user"],
      },
      label: "Camera 2, 0 front",
    }),
  );
  expect(camera.facingMode).toBe("front");
});

test("Back label is applied correctly", () => {
  const camera = new Camera(
    createInputDeviceInfo({
      label: "Camera 1, 0 back",
      mockCapabilities: {
        facingMode: ["environment"],
      },
    }),
  );
  expect(camera.facingMode).toBe("back");
});
