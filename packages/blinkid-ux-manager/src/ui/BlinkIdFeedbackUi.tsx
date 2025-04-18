/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { cameraManagerStore } from "@microblink/camera-manager";
import type { Component } from "solid-js";
import {
  createEffect,
  createSignal,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";
import { createWithSignal } from "solid-zustand";
import { BlinkIdUiState } from "../core/blinkid-ui-state";
import {
  LocalizationProvider,
  LocalizationStrings,
  useLocalization,
} from "./LocalizationContext";
import { UiFeedbackOverlay } from "./UiFeedbackOverlay";

// this triggers extraction of CSS from the UnoCSS plugin
import "virtual:uno.css";

import { useBlinkIdUiStore } from "./BlinkIdUiStoreContext";
import { SmartEnvironmentProvider } from "@microblink/shared-components/SmartEnvironmentProvider";
import { OnboardingGuideModal } from "./dialogs/OnboardingGuideModal";
import { HelpButton, HelpModal } from "./dialogs/HelpModal";
import { ErrorModal } from "./dialogs/ErrorModal";

// `blinkIdUxManager` is not reactive
export const BlinkIdFeedbackUi: Component<{
  localization?: Partial<LocalizationStrings>;
}> = (props) => {
  const { store, updateStore } = useBlinkIdUiStore();

  // TODO: hacky, fix this
  // only used to map LOW_QUALITY_FRONT and LOW_QUALITY_BACK to SENSING_FRONT
  // and SENSING_BACK
  const [uiState, setUiState] = createSignal<BlinkIdUiState>(
    store.blinkIdUxManager.uiState,
  );

  // Handle errors during scanning
  createEffect(() => {
    const errorCallbackCleanup = store.blinkIdUxManager.addOnErrorCallback(
      (errorState) => {
        updateStore({ errorState });
      },
    );
    onCleanup(() => errorCallbackCleanup());
  });

  const playbackState = createWithSignal(cameraManagerStore)(
    (s) => s.playbackState,
  );

  const isProcessing = () => playbackState() === "capturing";

  // Processing is stopped, but we still want to show the feedback
  const shouldShowFeedback = () => {
    return (
      isProcessing() ||
      uiState().key === "SIDE_CAPTURED" ||
      uiState().key === "DOCUMENT_CAPTURED"
    );
  };

  createEffect(() => {
    const removeUiStateChangeCallback =
      store.blinkIdUxManager.addOnUiStateChangedCallback((newUiState) => {
        let appliedUiState = newUiState;
        const key = newUiState.key;

        setUiState(appliedUiState);
      });

    onCleanup(() => removeUiStateChangeCallback());
  });

  return (
    <div>
      <style
        id="blinkid-ux-manager-style"
        ref={(ref) => {
          if (window.__blinkidUxManagerCssCode) {
            ref.innerHTML = window.__blinkidUxManagerCssCode;
          }
        }}
      />
      <LocalizationProvider
        // setLocalizationRef={() => void 0}
        userStrings={props.localization}
      >
        <SmartEnvironmentProvider>
          {() => {
            const { t } = useLocalization();

            return (
              <>
                <Switch>
                  <Match when={store.errorState === "timeout"}>
                    <ErrorModal
                      header={t.scan_unsuccessful}
                      text={t.scan_unsuccessful_details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                  <Match when={uiState().key === "UNSUPPORTED_DOCUMENT"}>
                    <ErrorModal
                      header={t.document_not_recognized}
                      text={t.document_not_recognized_details}
                      shouldResetScanningSession={true}
                    />
                  </Match>
                </Switch>

                <Show when={shouldShowFeedback()}>
                  <UiFeedbackOverlay uiState={uiState()} />
                </Show>

                <HelpButton isProcessing={isProcessing()} />
              </>
            );
          }}
        </SmartEnvironmentProvider>

        <OnboardingGuideModal />
        <HelpModal />
      </LocalizationProvider>
    </div>
  );
};
