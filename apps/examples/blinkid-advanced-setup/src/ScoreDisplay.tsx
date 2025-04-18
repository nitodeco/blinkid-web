/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import {
  ProcessingStatus,
  ProcessResultWithBuffer,
} from "@microblink/blinkid-core";
import {
  BlinkIdUiStateKey,
  BlinkIdUxManager,
} from "@microblink/blinkid-ux-manager";
import { UiStateEvent } from "@microblink/feedback-stabilizer";
import {
  batch,
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js";
import { createStore, reconcile } from "solid-js/store";
import { FPS } from "yy-fps";

type Score = {
  key: string;
  score: number;
};

export const ScoreDisplay: Component<{
  blinkIdUxManager: BlinkIdUxManager;
}> = (props) => {
  // const [frameResult, setFrameResult] = createSignal<FrameAnalysisResult>();
  const [processingStatus, setProcessingStatus] =
    createSignal<ProcessingStatus>();
  const [scores, setScores] = createSignal<Record<string, number>>({});
  const [events, setEvents] = createSignal<UiStateEvent[]>([]);
  const [rawKey, setRawKey] = createSignal<BlinkIdUiStateKey>();

  const [sortedScores, setSortedScores] = createStore<Score[]>([]);

  const fps = new FPS({
    zIndex: 9999,
  });

  onCleanup(() => {
    fps.remove();
  });

  createEffect(() => {
    const callback = (frameResult: ProcessResultWithBuffer) => {
      fps.frame();
      // setFrameResult(frameResult);
      const scores = props.blinkIdUxManager.feedbackStabilizer.getScores();
      const events = props.blinkIdUxManager.feedbackStabilizer.getEventQueue();
      // console.log(blinkIdUxManager.rawUiStateKey);
      batch(() => {
        setEvents(events);
        setScores(scores);
        setRawKey(props.blinkIdUxManager.rawUiStateKey);
      });
      setProcessingStatus(
        frameResult.inputImageAnalysisResult.processingStatus,
      );
    };

    const cleanup = props.blinkIdUxManager.addOnFrameProcessCallback(callback);

    onCleanup(() => {
      cleanup();
    });
  });

  // Converts scores to a normalized format and sorts them
  // Inefficient, but understandable
  createEffect(() => {
    const scoreSum = Object.values(scores()).reduce(
      (acc, score) => acc + score,
      0,
    );

    const normalizedScores = Object.entries(scores()).reduce(
      (acc, [key, score]) => {
        return { ...acc, [key]: score / scoreSum };
      },
      {} as Record<string, number>,
    );

    const sorted = Object.entries(normalizedScores)
      .map((score) => {
        return {
          key: score[0],
          score: score[1],
        };
      })
      .sort((a, b) => b.score - a.score);

    // https://docs.solidjs.com/reference/store-utilities/reconcile
    // Use to have granular updates to the chart
    setSortedScores(reconcile(sorted));
  });

  const outline = {
    "text-shadow":
      "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
    margin: "0",
    padding: "0",
  };

  return (
    <div
      style={{
        position: "absolute",
        padding: "1rem",
        background: "rgba(0,0,0, 0.2)",
        "z-index": 9999,
        "pointer-events": "none",
        top: "40px",
        left: "40px",
      }}
    >
      <div
        style={{
          "min-width": "400px",
          width: "100%",
        }}
      >
        Events in queue: {events().length}
        <For each={sortedScores}>
          {(score) => {
            return (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  background: "rgba(0, 0, 0, 0.8)",
                }}
              >
                <div
                  style={{
                    "font-size": "14px",
                    "line-height": "1",
                    display: "flex",
                    "justify-content": "space-between",
                    padding: "1rem",
                    position: "relative",
                    "z-index": 1,
                  }}
                >
                  <pre style={outline}>{score.key}</pre>
                  <pre style={outline}>{score.score.toFixed(3)}</pre>
                </div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(228, 41, 41, 0.649)",
                    "transform-origin": "left",
                    transition: "transform 100ms ease",
                    transform: `scaleX(${String(score.score)})`,
                  }}
                />
              </div>
            );
          }}
        </For>
      </div>

      {/* other stuff */}
      <pre>{JSON.stringify(rawKey(), null, 2)}</pre>
      <Show when={processingStatus()}>
        {(processingStatus) => (
          <pre>Processing status: {processingStatus()}</pre>
        )}
      </Show>
    </div>
  );
};
