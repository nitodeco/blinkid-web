/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { BlinkIdUxManager } from "../core/BlinkIdUxManager";

import { CameraManagerComponent } from "@microblink/camera-manager";
import { renderWithOwner } from "@microblink/shared-components/renderWithOwner";
import { BlinkIdFeedbackUi } from "./BlinkIdFeedbackUi";
import { BlinkIdUiStoreProvider } from "./BlinkIdUiStoreContext";
import { LocalizationStrings } from "./LocalizationContext";

export type FeedbackUiOptions = {
  localizationStrings?: Partial<LocalizationStrings>;
  /**
   * If set to `true`, the BlinkID instance will not be terminated when the
   * feedback UI is unmounted.
   *
   * @defaultValue false
   */
  preserveSdkInstance?: boolean;
  showOnboardingGuide?: boolean;
  showHelpTooltipTimeout?: number;
};

export function createBlinkIdFeedbackUi(
  blinkIdUxManager: BlinkIdUxManager,
  cameraManagerComponent: CameraManagerComponent,
  {
    localizationStrings,
    // todo - implement this
    preserveSdkInstance,
    showOnboardingGuide = true,
    showHelpTooltipTimeout = 8000,
  }: FeedbackUiOptions = {},
) {
  // Use a ref or closure to handle the circular reference
  const dismountFeedbackUiRef = {
    current: () => {
      void 0;
    },
  };

  cameraManagerComponent.addOnDismountCallback(() => {
    // if the camera manager is unmounted, we need to unmount the feedback UI
    dismountFeedbackUiRef.current();
  });

  const unmountFunction = renderWithOwner(
    () => (
      <BlinkIdUiStoreProvider
        blinkIdUxManager={blinkIdUxManager}
        cameraManagerComponent={cameraManagerComponent}
        showOnboardingGuide={showOnboardingGuide}
        showHelpTooltipTimeout={showHelpTooltipTimeout}
        dismountFeedbackUi={() => dismountFeedbackUiRef.current()}
      >
        <BlinkIdFeedbackUi localization={localizationStrings} />
      </BlinkIdUiStoreProvider>
    ),
    cameraManagerComponent.feedbackLayerNode,
    cameraManagerComponent.owner,
  );

  dismountFeedbackUiRef.current = unmountFunction;
  return unmountFunction;
}
