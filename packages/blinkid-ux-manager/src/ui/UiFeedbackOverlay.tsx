/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { Rerun } from "@solid-primitives/keyed";
import {
  Component,
  createEffect,
  createSignal,
  Match,
  on,
  onCleanup,
  ParentComponent,
  Show,
  Switch,
} from "solid-js";
import { Motion, Presence } from "solid-motionone";

import { clsx } from "clsx";
import { BlinkIdUiState, blinkIdUiStateMap } from "../core/blinkid-ui-state";
import { useLocalization } from "./LocalizationContext";
import { feedbackMessages } from "./feedbackMessages";

// icons
import CardIconBack from "./assets/reticles/card-back.svg?component-solid";
import CardIconFront from "./assets/reticles/card-front.svg?component-solid";
import DoneIcon from "./assets/reticles/done.svg?component-solid";
import FullIcon from "./assets/reticles/full.svg?component-solid";
import SearchIcon from "./assets/reticles/searching.svg?component-solid";
import ScanIcon from "./assets/reticles/spin.svg?component-solid";

export const UiFeedbackOverlay: Component<{
  uiState: BlinkIdUiState;
}> = (props) => {
  /**
   * This is a hack since we don't have a discrete state for both a successful
   * scan and a card flip.
   */

  const [showSuccessOnly, setShowSuccessOnly] = createSignal(false);
  let timeout: number;

  createEffect(() => {
    if (props.uiState.key === "SIDE_CAPTURED") {
      setShowSuccessOnly(true);
      // TODO: incorrectly resolving to NodeJS timeout
      timeout = window.setTimeout(
        () => setShowSuccessOnly(false),
        blinkIdUiStateMap.DOCUMENT_CAPTURED.minDuration,
      );
    } else {
      setShowSuccessOnly(false);
      clearTimeout(timeout!);
    }

    onCleanup(() => clearTimeout(timeout!));
  });

  return (
    <>
      <div class="absolute left-0 top-0 grid size-full select-none place-items-center">
        <div>
          <div class="size-24">
            <div class="absolute" aria-hidden>
              <Switch>
                <Match when={props.uiState.reticleType === "searching"}>
                  <SearchReticle />
                </Match>
                <Match when={props.uiState.reticleType === "processing"}>
                  <ScanningReticle />
                </Match>
                <Match when={props.uiState.reticleType === "error"}>
                  <ErrorReticle />
                </Match>
                <Match
                  when={
                    props.uiState.reticleType === "done" || showSuccessOnly()
                  }
                >
                  <SuccessFeedback />
                </Match>
                <Match
                  when={
                    props.uiState.reticleType === "flip" && !showSuccessOnly()
                  }
                >
                  <FlipCardFeedback />
                </Match>
              </Switch>
            </div>
          </div>
          <Show when={!showSuccessOnly()}>
            <UiFeedbackMessage uiState={props.uiState} />
          </Show>
        </div>
      </div>
    </>
  );
};

const SuccessFeedback: Component = () => (
  <Motion
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{
      opacity: 1,
      scale: 1,
      transition: { easing: "ease-in-out", duration: 0.3 },
    }}
    exit={{ opacity: 0, scale: 5 }}
  >
    <DoneIcon class="[&>path]:fill-[initial] size-24 drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]" />
  </Motion>
);

const carSideStyles = `w-35 backface-hidden drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]`;

const FlipCardFeedback: Component = () => (
  // fix magic number -24px
  <div class="relative perspective-300px left--6">
    <Motion
      class="relative preserve-3d"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        rotateY: ["180deg"],
        transition: {
          rotateY: {
            duration: blinkIdUiStateMap.SIDE_CAPTURED.minDuration / 1000,
          },
          opacity: {
            duration: 0.5,
          },
        },
      }}
      exit={{ opacity: 0 }}
    >
      <CardIconFront class={carSideStyles} />
      <CardIconBack
        class={clsx(
          carSideStyles,
          "absolute top-0 left-0 w-full transform rotate-y-180",
        )}
      />
    </Motion>
  </div>
);

const ReticleContainer: ParentComponent<{
  type: BlinkIdUiState["reticleType"];
}> = (props) => {
  return (
    <Motion.div
      class={clsx(
        "grid size-24 place-items-center rounded-full backdrop-blur-xl bg-opacity-30",
        props.type === "error" ? "bg-error-500 " : "bg-dark-100",
      )}
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { delay: 0.05 },
      }}
      transition={{ duration: 0.05 }}
    >
      {props.children}
    </Motion.div>
  );
};

const SearchReticle: Component = () => (
  <ReticleContainer type="searching">
    <Motion
      class="will-change-transform"
      animate={{ opacity: 1, transform: "rotate(360deg)" }}
      transition={{
        transform: {
          duration: 1,
          easing: "ease-in-out",
          repeat: Infinity,
        },
      }}
    >
      <SearchIcon class="size-12" />
    </Motion>
  </ReticleContainer>
);

const ErrorReticle: Component = () => (
  <ReticleContainer type="error">
    <FullIcon class="size-12" />
  </ReticleContainer>
);

const ScanningReticle: Component = () => (
  <ReticleContainer type="processing">
    <Motion
      animate={{ opacity: 1, rotate: "360deg" }}
      transition={{
        rotate: {
          duration: 0.8,
          easing: [0.23, 0.58, 0.58, 0.23],
          repeat: Infinity,
        },
      }}
    >
      <ScanIcon class="size-12" />
    </Motion>
  </ReticleContainer>
);

/**
 * This component displays feedback messages to the user.
 * Shown below the reticle.
 */
const UiFeedbackMessage: Component<{
  uiState: BlinkIdUiState;
}> = (props) => {
  const { t } = useLocalization();

  const message = () => {
    const key = props.uiState.key;
    if (key in feedbackMessages) {
      return feedbackMessages[key];
    }

    return;
  };

  return (
    <div class="absolute left-0 mt-2 w-full flex justify-center">
      <Presence exitBeforeEnter>
        <Rerun on={() => props.uiState.key}>
          <Show when={message()}>
            <Motion.div
              initial={{ opacity: 0, transform: "translateY(2rem)" }}
              animate={{
                opacity: 1,
                transform: "translateY(0)",
                transition: { delay: 0.05 },
              }}
              transition={{ duration: 0.05 }}
              exit={{ opacity: 0, transform: "translateY(-2rem)" }}
              class="max-w-45 text-base gap-1 rounded-2 bg-opacity-30 bg-dark-100 px-2 py-3
                text-center text-balance text-white font-bold
                text-shadow-[0_1px_4px_rgba(0,0,0,0.1)] backdrop-blur-xl will-change-transform"
            >
              <div role="alert">{t[message()!]}</div>
            </Motion.div>
          </Show>
        </Rerun>
      </Presence>
    </div>
  );
};

// i used this somewhere, no idea where
// h-vh supports-[(height:100dvh)]:h-dvh
