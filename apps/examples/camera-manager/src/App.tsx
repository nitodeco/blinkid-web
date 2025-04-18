/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/* @refresh reload */

import {
  CameraManager,
  createCameraManagerUi,
} from "@microblink/camera-manager";
import { Component, Show } from "solid-js";
import { FPS } from "yy-fps";

const DEBUG_FPS = true;
const PORTAL = true;

export const App: Component = () => {
  const cameraManager = new CameraManager();

  let fps: FPS | null = null;

  let canvas!: HTMLCanvasElement;

  const initialize = async () => {
    const cameraUi = await createCameraManagerUi(
      cameraManager,
      !PORTAL ? document.getElementById("root")! : undefined,
    );

    // await cameraManager.setResolution("1080p");

    // cameraManager.setFacingFilter(["back", undefined]);
    await cameraManager.startCameraStream({
      preferredCamera: (cameras) => {
        const myCamera = cameras.find((camera) =>
          camera.name.toLowerCase().includes("obs"),
        );

        if (myCamera) {
          console.log("📷 Found camera", myCamera);
        }

        return myCamera;
      },
    });

    if (DEBUG_FPS) {
      fps = new FPS({
        FPS: 30,
      });

      const ctx = canvas.getContext("2d")!;

      const countFps = () => fps!.frame();
      const removeFrameCaptureCallback = cameraManager.addFrameCaptureCallback(
        (imageData) => {
          countFps();
          canvas.width = imageData.width;
          canvas.height = imageData.height;
          ctx.putImageData(imageData, 0, 0);
        },
      );

      cameraUi.addOnDismountCallback(() => {
        console.log("🧹 Cleaning up");
        fps?.remove();
        removeFrameCaptureCallback();
      });
      await cameraManager.startFrameCapture();
    }
  };

  // onMount(() => {
  //   void initialize();
  // });

  return (
    <div>
      <button onClick={() => void initialize()}>Scan</button>
      <Show when={DEBUG_FPS}>
        <canvas
          ref={canvas}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            "z-index": 999999,
            "pointer-events": "none",
            display: "block",
            "max-width": "50%",
            outline: "1px solid red",
          }}
        />
      </Show>
    </div>
  );
};
