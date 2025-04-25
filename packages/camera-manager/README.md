# @microblink/camera-manager

This package provides camera management for web applications. It handles camera selection, permissions, video stream management, and provides access to video frames for further processing. It is framework-agnostic and can be used with or without a UI.

## Overview

- Handles camera selection, permissions, and video stream lifecycle.
- Provides access to video frames for downstream processing.
- Can be used standalone or with the included UI components.
- Used by [`@microblink/blinkid-ux-manager`](https://www.npmjs.com/package/@microblink/blinkid-ux-manager) and [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid).

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/camera-manager
# or
yarn add @microblink/camera-manager
# or
pnpm add @microblink/camera-manager
```

## Usage

### Basic Example

```js
import { CameraManager } from "@microblink/camera-manager";

const cameraManager = new CameraManager();

// Start the camera stream (auto-selects the best camera)
await cameraManager.startCameraStream();

// Optionally, attach the video to a DOM element
const video = document.getElementById("video");
cameraManager.initVideoElement(video);

// Capture frames for processing
const removeCallback = cameraManager.addFrameCaptureCallback((imageData) => {
  // Process imageData (instance of ImageData)
});

// Stop the camera when done
cameraManager.stopStream();
```

See the [`camera-manager` example](../../apps/examples/camera-manager/src/App.tsx) for more usage details.

## API

### `CameraManager` class

- `startCameraStream(options?)`: Starts the camera stream. Options allow selecting a specific camera or facing mode.
- `initVideoElement(videoElement)`: Attaches a video element for preview.
- `addFrameCaptureCallback(callback)`: Registers a callback to receive frames as `ImageData` during capture. Returns a cleanup function.
- `startFrameCapture()`: Starts capturing frames for processing.
- `stopFrameCapture()`: Stops capturing frames but keeps the stream active.
- `stopStream()`: Stops the camera stream and video playback.
- `setResolution(resolution)`: Sets the desired video resolution (e.g., `"1080p"`).
- `setFacingFilter(facingModes)`: Filters available cameras by facing mode (`"front"` or `"back"`).
- `getCameraDevices()`: Returns available camera devices.
- `selectCamera(camera)`: Selects a specific camera device.
- `setCameraMirrorX(mirrorX)`: Mirrors the video horizontally if needed.
- `reset()`: Resets the camera manager and stops all streams.

### UI Integration

To use the built-in UI, use:

```js
import { createCameraManagerUi } from "@microblink/camera-manager";

const cameraUi = await createCameraManagerUi(cameraManager, document.body);
// Optionally, add cleanup:
cameraUi.dismount();
```
