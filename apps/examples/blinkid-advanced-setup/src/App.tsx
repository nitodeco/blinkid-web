/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/* @refresh reload */

import {
  BlinkIdScanningResult,
  loadBlinkIdCore,
} from "@microblink/blinkid-core";
import {
  BlinkIdUxManager,
  createBlinkIdFeedbackUi,
} from "@microblink/blinkid-ux-manager";
import {
  CameraManager,
  createCameraManagerUi,
  FrameCaptureCallback,
} from "@microblink/camera-manager";

import { Component, createSignal, onMount, Show } from "solid-js";
import { ScoreDisplay } from "./ScoreDisplay";

import { Traverse } from "neotraverse/modern";

const SHOW_DEBUG = import.meta.env.VITE_SHOW_DEBUG === "true";
const USE_PORTAL = import.meta.env.VITE_USE_PORTAL === "true";

const targetNode = !USE_PORTAL ? document.getElementById("root")! : undefined;

export const App: Component = () => {
  const [result, setResult] = createSignal<BlinkIdScanningResult>();
  const [blinkIdUxManager, setBlinkIdUxManager] =
    createSignal<BlinkIdUxManager>();
  const [loadState, setLoadState] = createSignal<
    "not-loaded" | "loading" | "ready"
  >("not-loaded");

  /**
   * This function removes the images from the result object
   */
  const resultWithoutImages = () => {
    const resultCopy = structuredClone(result());

    new Traverse(resultCopy).forEach((ctx, value) => {
      if (value instanceof Uint8Array) {
        ctx.update(new Uint8Array());
      }
    });

    return resultCopy;
  };

  async function init() {
    setLoadState("loading");

    // we first initialize the direct API. This loads the WASM module and initializes the engine
    const blinkIdCore = await loadBlinkIdCore({
      licenseKey: import.meta.env.VITE_LICENCE_KEY,
      wasmVariant: "advanced",
    });

    const session = await blinkIdCore.createBlinkIdScanningSession({});

    // we create the camera manager
    const cameraManager = new CameraManager();
    //
    // await cameraManager.setResolution("720p");

    // we create the UX manager
    const blinkIdUxManager = new BlinkIdUxManager(cameraManager, session);
    // blinkIdUxManager.setTimeoutDuration(500);

    setBlinkIdUxManager(blinkIdUxManager);

    // this creates the UI and attaches it to the DOM
    const cameraUi = await createCameraManagerUi(cameraManager, targetNode);

    cameraUi.addOnDismountCallback(() => {
      void blinkIdCore.terminate();
      setBlinkIdUxManager(undefined);
      setLoadState("not-loaded");
    });

    blinkIdUxManager.addOnResultCallback((result) => {
      setResult(result);
      cameraUi.dismount();
    });

    // const exampleCallback: FrameCaptureCallback = (imageData: ImageData) => {
    //   // sleep 100ms
    //   console.log(imageData.width, imageData.height);
    //   // await new Promise((resolve) => setTimeout(resolve, 150));

    //   return imageData.data.buffer;
    // };

    // async functions will throttle the frame capture
    // cameraManager.addFrameCaptureCallback(exampleCallback);

    const unsub = cameraManager.subscribe(
      (s) => s.playbackState,
      (state) => {
        if (state === "playback") {
          // this creates the feedback UI and attaches it to the camera UI
          createBlinkIdFeedbackUi(blinkIdUxManager, cameraUi, {
            showOnboardingGuide: true,
            // example of localization update
            // localizationStrings: {
            //   scan_the_front_side: "Scan the front side of the ID card",
            // },
          });

          // await cameraManager.startFrameCapture();

          setLoadState("ready");
          unsub(); // unsubscribe from the playback state
        }
      },
    );

    await cameraManager.startCameraStream();
  }

  onMount(() => {
    void init();
  });

  return (
    <div>
      <Show when={loadState() !== "ready"}>
        <button
          disabled={loadState() === "loading"}
          onClick={() => void init()}
        >
          Load
        </button>
      </Show>
      {/* debug */}
      <Show when={SHOW_DEBUG && blinkIdUxManager() && !resultWithoutImages()}>
        <ScoreDisplay blinkIdUxManager={blinkIdUxManager()!} />
      </Show>

      {/* results */}
      <Show when={resultWithoutImages()}>
        {(trimmedResult) => (
          <pre>{JSON.stringify(trimmedResult(), null, 2)}</pre>
        )}
      </Show>
    </div>
  );
};
