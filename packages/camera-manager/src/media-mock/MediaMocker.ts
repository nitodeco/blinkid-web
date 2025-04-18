/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { FacingMode } from "../core/Camera";
import { createInputDeviceInfo } from "./createInputDeviceInfo";
import { defineProperty } from "./defineProperty";
import { ExtendedCameraInfo, fakeDevices } from "./fake-devices";
import { getFPSFromConstraints, getResolutionFromConstraints } from "./utils";

export type MediaMockerOptions = Partial<{
  device: keyof typeof fakeDevices;
  facing: FacingMode;
  reverseCameraOrder: boolean;
}>;

class MediaMocker {
  fakeDevice: keyof typeof fakeDevices = "iPhone 15";
  facing: FacingMode = "back";
  cameras: ExtendedCameraInfo[];

  #activeStreamConstraints?: MediaStreamConstraints;

  #unmockEnumerateDevices?: () => void;
  #unmockGetUserMedia?: () => void;

  constructor(options?: MediaMockerOptions) {
    this.fakeDevice = options?.device ?? this.fakeDevice;
    this.facing = options?.facing ?? this.facing;
    this.cameras = structuredClone(fakeDevices[this.fakeDevice].cameras);

    if (options?.reverseCameraOrder) {
      this.cameras.reverse();
    }
  }

  reverseCameraOrder() {
    this.cameras.reverse();
  }

  getCameraDevices() {
    return fakeDevices[this.fakeDevice].cameras;
  }

  setDevice(device: keyof typeof fakeDevices) {
    this.fakeDevice = device;
    this.cameras = structuredClone(fakeDevices[this.fakeDevice].cameras);
  }

  configure(options: MediaMockerOptions) {
    if (options.device) {
      this.fakeDevice = options.device;
      this.cameras = structuredClone(fakeDevices[this.fakeDevice].cameras);
    }

    if (options.facing) {
      this.facing = options.facing;
    }

    if (options.reverseCameraOrder) {
      this.reverseCameraOrder();
    }
  }

  mockEnumerateDevices() {
    const unmockEnumerateDevices = defineProperty(
      navigator.mediaDevices,
      "enumerateDevices",
      (): Promise<InputDeviceInfo[]> => {
        const devices = this.cameras.map((camera) => {
          return createInputDeviceInfo(camera.inputDeviceInfo);
        });

        return Promise.resolve(devices);
      },
    );
    this.#unmockEnumerateDevices = unmockEnumerateDevices;
  }

  unmockEnumerateDevices() {
    if (this.#unmockEnumerateDevices) {
      this.#unmockEnumerateDevices();
    }
  }

  mock() {
    this.mockEnumerateDevices();
    this.mockGetUserMedia();
  }

  mockGetUserMedia() {
    const unmockGetUserMedia = defineProperty(
      navigator.mediaDevices,
      "getUserMedia",
      (constraints: MediaStreamConstraints) => {
        return this.createFakeStream(constraints);
      },
    );

    this.#unmockGetUserMedia = unmockGetUserMedia;
  }

  unmockGetUserMedia() {
    if (this.#unmockGetUserMedia) {
      this.#unmockGetUserMedia();
    }
  }

  unmock() {
    this.unmockEnumerateDevices();
    this.unmockGetUserMedia();
    this.resetStreamConstraints();
  }

  resetStreamConstraints() {
    this.#activeStreamConstraints = undefined;
  }

  /**
   * @see MediaDevices.getUserMedia
   */
  createFakeStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    this.#activeStreamConstraints = constraints;

    const fakeStream = new MediaStream();
    const fakeTrack = this.createFakeTrack();

    defineProperty(fakeStream, "getVideoTracks", () => {
      return [fakeTrack];
    });

    return Promise.resolve(fakeStream);
  }

  createFakeTrack(): MediaStreamTrack {
    const constraints = this.#activeStreamConstraints;

    if (!constraints) {
      throw new Error("No active stream constraints");
    }

    const mockCamera = this.findDeviceMatchingConstraints();

    const fakeTrack: MediaStreamTrack = {
      contentHint: "",
      id: mockCamera.inputDeviceInfo.deviceId,
      kind: "video",
      label: mockCamera.inputDeviceInfo.label,
      muted: false,
      enabled: true,
      readyState: "live",
      onended: null,
      onmute: null,
      onunmute: null,
      clone: () => {
        return this.createFakeTrack();
      },
      applyConstraints: async () => {
        return Promise.resolve();
      },
      getCapabilities: () => {
        return mockCamera.streamCapabilities;
      },
      getConstraints: () => {
        return {}; // TODO: implement
      },
      getSettings: () => {
        const { width, height } = getResolutionFromConstraints(constraints);

        const settings: MediaTrackSettings = structuredClone(
          mockCamera.mediaTrackSettings,
        );

        settings.width = width;
        settings.height = height;
        settings.aspectRatio = width / height;

        return settings;
      },
      stop: () => {
        return;
      },
      addEventListener: () => {
        return;
      },
      removeEventListener: () => {
        return;
      },
      dispatchEvent: () => {
        return true;
      },
    };

    return fakeTrack;
  }

  findDeviceMatchingConstraints() {
    const constraints = this.#activeStreamConstraints;

    if (!constraints) {
      throw new Error("No active stream constraints");
    }

    if (!constraints.video) {
      throw new Error("No video constraints provided");
    }

    if (constraints.video === true) {
      // just return the last camera, implement better logic later
      return this.cameras[this.cameras.length - 1];
    }

    // might be a string or an object

    let deviceId = "";

    if (typeof constraints.video === "object" && constraints.video.deviceId) {
      if (typeof constraints.video.deviceId === "string") {
        deviceId = constraints.video.deviceId;
      }

      if (typeof constraints.video.deviceId === "object") {
        if (
          "exact" in constraints.video.deviceId &&
          typeof constraints.video.deviceId.exact === "string"
        ) {
          deviceId = constraints.video.deviceId.exact;
        }
      }

      if (deviceId === "") {
        throw new Error("Couldn't calculate deviceId");
      }

      const foundDevice = this.cameras.find(
        (camera) => camera.inputDeviceInfo.deviceId === deviceId,
      );

      if (!foundDevice) {
        throw new Error(`No device found for deviceId`);
      }

      return foundDevice;
    }

    throw new Error("Invalid constraints");
  }
}

export const mediaMocker = new MediaMocker();
