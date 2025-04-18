/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

// TODO: use https://github.com/hexagon/proper-tags

import { stripIndents } from "common-tags";
import {
  Camera,
  FacingMode,
  VideoResolutionName,
  videoResolutions,
} from "./Camera";
import { isBackCameraName, isFrontCameraName } from "./cameraNames";
import { backDualWideCameraLocalizations } from "./iosCameraNames";
import { asError } from "./utils";

// eslint-disable-next-line @typescript-eslint/ban-types
type CameraErrorCode = "PERMISSION_DENIED" | (string & {});

export class CameraError extends Error {
  code: CameraErrorCode;

  constructor(message: string, code: CameraErrorCode, cause?: Error) {
    super(message);
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Trigger camera permission dialog.
 */
export const askForCameraPermission = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    closeStreamTracks(mediaStream);
  } catch (error) {
    console.log(error);

    const newError = new CameraError(
      "Camera permission not given",
      "PERMISSION_DENIED",
      asError(error),
    );

    throw newError;
  }
};

/**
 * Returns available camera devices on the user's device.
 * @returns An array of {@linkcode InputDeviceInfo} objects representing the available camera devices.
 */
export const obtainVideoInputDevices = async () => {
  if (!isSecureContext) {
    throw new Error(stripIndents`
      Cameras can only be used in a secure context:
      https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
    `);
  }

  await askForCameraPermission();

  const allDevices = await navigator.mediaDevices.enumerateDevices();

  const cameraDevices = allDevices.filter((device) => {
    // we don't check `instanceof` because of mocking in tests
    return device.kind === "videoinput";
  });

  return cameraDevices as InputDeviceInfo[];
};

export const closeStreamTracks = (stream: MediaStream) => {
  const tracks = stream.getTracks();
  for (const track of tracks) {
    track.stop();
  }
};

export const createConstraints = (
  resolution: VideoResolutionName,
  facing?: FacingMode,
  id?: Camera["deviceInfo"]["deviceId"],
) => {
  const constraints: MediaStreamConstraints = {
    video: {
      deviceId: id ? { exact: id } : undefined,
      frameRate: 30,
      aspectRatio: {
        exact:
          videoResolutions[resolution].width /
          videoResolutions[resolution].height,
      },
      width: {
        ideal: videoResolutions[resolution].width,
      },
      height: {
        ideal: videoResolutions[resolution].height,
      },
      facingMode: facing,
    },
    audio: false,
  };

  return constraints;
};

/**
 * Finds the ideal camera based on the provided constraints.
 *
 * @param cameras Available {@linkcode Camera}s on the device
 * @param resolution Ideal resolution for the camera stream, will fall back to the closest available resolution.
 * @param requestedFacing Ideal facing mode for the camera stream. If not provided, will default to back camera.
 * If no facing mode is available, will return a best effort match.
 *
 * @returns A {@linkcode Camera} instance that matches the provided constraints, with an active stream.
 */
export const findIdealCamera = async (
  cameras: Camera[],
  resolution: VideoResolutionName = "4k",
  requestedFacing: FacingMode = "back",
): Promise<Camera> => {
  if (cameras.length === 0) {
    throw new Error("No cameras found");
  }

  // early exit for iPhone 12+
  // Dual wide camera is the best, if it exists and requested facing is back

  if (requestedFacing === "back") {
    const dualWideCamera = cameras.find((camera) =>
      backDualWideCameraLocalizations.includes(camera.name),
    );

    if (dualWideCamera) {
      // TODO: check if we need to pass the resolution here
      // make sure to return Camera with active stream
      await dualWideCamera.startStream(resolution);
      return dualWideCamera;
    }
  }

  // Other devices
  // Create a pool of cameras filtered by facing via keywords
  const cameraPool = cameras.filter((camera) => {
    // if no facing is requested, we default to back camera
    if (requestedFacing === "back" || requestedFacing === undefined) {
      return isBackCameraName(camera.name);
    } else {
      return isFrontCameraName(camera.name);
    }
  });

  // if there's only one camera in the pool and it matches the requested facing
  // we can return it immediately
  if (cameraPool.length === 1 && cameraPool[0].facingMode === requestedFacing) {
    await cameraPool[0].startStream(resolution);
    return cameraPool[0];
  }

  // if we're looking for a front camera, return the last one in the pool if
  // there are multiple ones
  if (cameraPool.length > 0 && requestedFacing === "front") {
    const lastCamera = cameraPool[cameraPool.length - 1];
    // make sure to return Camera with active stream
    await lastCamera.startStream(resolution);
    return lastCamera;
  }

  // if there are no cameras in the pool, use all cameras
  if (cameraPool.length === 0) {
    console.debug("No camera found with requested facing, using all cameras");
    cameraPool.push(...cameras);
  }

  // otherwise, we need to rank the cameras based on their capabilities
  // these cameras are either back-facing or undefined facing

  /** Used to rank cameras via test streams */
  const cameraScores = new Map<Camera, number>();
  cameras.forEach((camera) => cameraScores.set(camera, 0));

  // iPhone 8, 8 Plus and X have dual cameras, but not the virtual dual camera
  // SE devices have only one camera
  // Use this same branch for Android and desktop

  // we iterate in reverse order to prioritize the last camera
  // this is usually the best camera on Android
  for (let i = cameraPool.length - 1; i >= 0; i--) {
    const camera = cameraPool[i];

    // this will correct the facing in the Camera instance in case of a mismatch
    await camera.startStream(resolution);

    // console.debug(JSON.stringify(camera, null, 2));

    // the stream is active from this point, we hand off an active stream when returning the `Camera` instance

    if (!camera.facingMode) {
      // desktop camera?
      // we can't determine facing mode, so we just return the last camera
      console.debug("No facing mode, returning last camera");
      return camera;
    }

    // mismatched facing mode, move on to the next camera
    if (camera.facingMode && camera.facingMode !== requestedFacing) {
      console.debug("Mismatched facing mode, moving on to the next camera");
      camera.stopStream();
      continue;
    }

    // camera facing matches

    // we now check for single-shot and torch support
    // if it supports both, we know it's the best camera

    if (camera.torchSupported && camera.singleShotSupported) {
      console.debug("Camera supports torch and single shot, returning");
      return camera;
    }

    // if it supports only one, we give it a score and pick the
    // best one once we've iterated all cameras
    if (camera.torchSupported) {
      cameraScores.set(camera, cameraScores.get(camera)! + 1);
    }

    if (camera.singleShotSupported) {
      cameraScores.set(camera, cameraScores.get(camera)! + 1);
    }

    // if it's the last camera in the pool, we need to pick one
    if (i === 0) {
      console.debug("Last camera in the pool, picking the best one");
      // return the camera from the pool with the highest score from the Map
      let maxKey: Camera | undefined;
      let maxValue = -Infinity;

      // TODO: check if we handle ties correctly
      cameraScores.forEach((score, camera) => {
        if (score > maxValue) {
          maxValue = score;
          maxKey = camera;
        }
      });

      return maxKey!;
    }

    // otherwise we move on to the next camera
    camera.stopStream();
  }

  throw new Error("No camera found, should not happen");
};

/**
 * Creates an array of {@linkcode Camera} instances with stream from native
 * `deviceInfo` objects.
 */
export function createCameras(cameras: InputDeviceInfo[]) {
  const camerasWithStream: Camera[] = [];

  for (const device of cameras) {
    const camera = new Camera(device);
    if (camera !== null) {
      camerasWithStream.push(camera);
    }
  }

  return camerasWithStream;
}
