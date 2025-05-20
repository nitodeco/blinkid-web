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

const SHOW_DEBUG = true;
const USE_PORTAL = true;
const SHOW_ONBOARDING = false;

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

    for (const subResult of resultCopy?.subResults ?? []) {
      // remove the images from the sub result
      delete subResult?.inputImage;
      delete subResult?.documentImage;
      delete subResult?.faceImage;
      delete subResult?.signatureImage;
      delete subResult?.barcodeInputImage;
    }

    return resultCopy;
  };

  async function init() {
    setLoadState("loading");
    setResult(undefined);

    // we first initialize the direct API. This loads the WASM module and initializes the engine
    const blinkIdCore = await loadBlinkIdCore({
      licenseKey: import.meta.env.VITE_LICENCE_KEY,
      // wasmVariant: "advanced",
    });

    console.log("creating new session");

    const session = await blinkIdCore.createBlinkIdScanningSession({
      scanningSettings: {
        // scanPassportDataPageOnly: false,
      },
    });

    // we create the camera manager
    const cameraManager = new CameraManager();
    //

    // we create the UX manager
    const uxManager = new BlinkIdUxManager(cameraManager, session);
    uxManager.setTimeoutDuration(2000000);

    setBlinkIdUxManager(uxManager);

    // this creates the UI and attaches it to the DOM
    const cameraUi = await createCameraManagerUi(cameraManager, targetNode, {
      showMirrorCameraButton: true,
    });

    cameraUi.addOnDismountCallback(() => {
      void blinkIdCore.terminate();
      setBlinkIdUxManager(undefined);
      setLoadState("not-loaded");
    });

    uxManager.addOnResultCallback((result) => {
      setResult(result);
      cameraUi.dismount();
    });

    // uxManager.addOnFrameProcessCallback(() => {
    //   console.log(uxManager.rawUiStateKey);
    // });

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

    await cameraManager.startCameraStream({
      preferredCamera: (cameras) => {
        return cameras.find((camera) =>
          camera.name.toLowerCase().includes("obs"),
        );
      },
    });
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
