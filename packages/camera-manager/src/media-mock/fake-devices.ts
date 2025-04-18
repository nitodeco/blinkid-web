/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { MockiPhone15 } from "./fakeDevices/iPhone15";
import { MockiPhoneSE } from "./fakeDevices/iPhoneSE";
import { MockSamsungS21FE } from "./fakeDevices/SamsungS21FE";

/**
 * `deviceCapabilities` and `streamCapabilities` seem to be the same on iOS Safari
 */
export type ExtendedCameraInfo = {
  inputDeviceInfo: Omit<InputDeviceInfo, "getCapabilities" | "toJSON">;
  deviceCapabilities: ReturnType<InputDeviceInfo["getCapabilities"]>;
  streamCapabilities: ReturnType<MediaStreamTrack["getCapabilities"]>;
  mediaTrackSettings: ReturnType<MediaStreamTrack["getSettings"]>;
};

export type FakeDevice = {
  name: string;
  cameras: ExtendedCameraInfo[];
};

export const fakeDevices: Record<string, FakeDevice> = {
  "Samsung S21FE": MockSamsungS21FE,
  "iPhone 15": MockiPhone15,
  "iPhone SE": MockiPhoneSE,
} as const;
