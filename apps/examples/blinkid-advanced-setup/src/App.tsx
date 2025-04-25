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
} from "@microblink/camera-manager";

import { Component, createSignal, onMount, Show } from "solid-js";
import { ScoreDisplay } from "./ScoreDisplay";

import { Traverse } from "neotraverse/modern";

const SHOW_DEBUG = false;
const USE_PORTAL = true;
const SHOW_ONBOARDING = true;

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
    const uxManager = new BlinkIdUxManager(cameraManager, session);

    setBlinkIdUxManager(uxManager);

    // this creates the UI and attaches it to the DOM
    const cameraUi = await createCameraManagerUi(cameraManager, targetNode);

    cameraUi.addOnDismountCallback(() => {
      void blinkIdCore.terminate();
      setBlinkIdUxManager(undefined);
      setLoadState("not-loaded");
    });

    uxManager.addOnResultCallback((result) => {
      setResult(result);
      cameraUi.dismount();
    });

    // We wait until the video starts playing before we create the feedback UI
    // and start the frame capture. This also allows for the user to retry granting
    // camera permissions if they are not granted on the first try.
    const unsub = cameraManager.subscribe(
      (s) => s.playbackState,
      (state) => {
        if (state === "playback") {
          // this creates the feedback UI and attaches it to the camera UI
          createBlinkIdFeedbackUi(uxManager, cameraUi, {
            showOnboardingGuide: SHOW_ONBOARDING,
            // example of localization update
            // localizationStrings: {
            //   scan_the_front_side: "Scan the front side of the ID card",
            // },
          });

          // if we are not showing the onboarding guide, we start the frame
          // capture manually otherwise, the user will be prompted to start the
          // frame capture
          if (!SHOW_ONBOARDING) {
            void cameraManager.startFrameCapture();
          }

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
