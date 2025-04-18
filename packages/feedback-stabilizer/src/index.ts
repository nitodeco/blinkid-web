/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { getKeyWithHighestValue } from "./utils";
import { StringKeyOf } from "type-fest";

/* TODO: fix type inference */

export type UiState = {
  key: string;
  minDuration: number;
  /**
   * If true, the event will be emitted once the previous event is done.
   * It's not going through the averaging process
   */
  singleEmit?: boolean;
  initialWeight?: number;
};

export type UiStateEvent = {
  key: string;
  timeStamp: DOMHighResTimeStamp;
  currentWeight: number;
  /**
   * If true, the event will be emitted once the previous event is done.
   * It's not going through the averaging process
   */
  singleEmit?: boolean;
};

export type UiStateMap = Record<string, UiState>;

export class FeedbackStabilizer<SdkSpecificStateMap extends UiStateMap> {
  private initialKey: StringKeyOf<SdkSpecificStateMap>;
  private uiStateMap: SdkSpecificStateMap;
  private timeWindow = 3000;
  private decayRate = 0.95;
  private eventQueue: UiStateEvent[] = [];
  /** this is a special queue as min duration of the event can be longer than the `timeWindow` */
  private singleEventQueue: UiStateEvent[] = [];
  // used for tracking current state
  private currentKey: StringKeyOf<SdkSpecificStateMap>;
  private currentStateStartTime = performance.now();
  private summedScores: Record<string, number> = {};
  private scoreBoard: Record<string, number[]> = {};

  get currentState() {
    return this.uiStateMap[this.currentKey];
  }

  getEventQueue() {
    return structuredClone(this.eventQueue);
  }

  getScores() {
    return structuredClone(this.summedScores);
  }

  getScoreBoard() {
    return structuredClone(this.scoreBoard);
  }

  setTimeWindow(timeWindow: number) {
    this.timeWindow = timeWindow;
  }

  constructor(
    uiStateMap: SdkSpecificStateMap,
    initialKey: StringKeyOf<SdkSpecificStateMap>,
    timeWindow?: number,
    decayRate?: number,
  ) {
    this.uiStateMap = uiStateMap;
    this.initialKey = initialKey;
    this.currentKey = initialKey;

    this.getNewUiState(initialKey);

    if (timeWindow) {
      this.timeWindow = timeWindow;
    }
    if (decayRate) {
      this.decayRate = decayRate;
    }
  }

  reset() {
    this.currentKey = this.initialKey;
    this.eventQueue = [];
    this.singleEventQueue = [];
    this.summedScores = {};
  }

  canShowNewUiState = () => {
    return (
      performance.now() - this.currentStateStartTime >=
      this.currentState.minDuration
    );
  };

  /**
   * Returns a weighted UI state based on the history
   */
  getNewUiState(
    incomingUiStateKey: StringKeyOf<SdkSpecificStateMap>,
  ): SdkSpecificStateMap[StringKeyOf<SdkSpecificStateMap>] {
    const now = performance.now();

    const initialWeight = this.uiStateMap[incomingUiStateKey].initialWeight;

    // create new event
    const uiStateEvent: UiStateEvent = {
      key: incomingUiStateKey,
      timeStamp: now,
      currentWeight: initialWeight ?? 1,
      singleEmit: this.uiStateMap[incomingUiStateKey].singleEmit,
    };

    // single emitted events are placed in a different queue and emitted once the previous event is done
    if (uiStateEvent.singleEmit) {
      this.singleEventQueue.push(uiStateEvent);
    }

    // if there is a single event in the queue, show it
    if (this.singleEventQueue.length > 0) {
      const singleEvent = this.singleEventQueue.shift()!; // we know it's not empty
      // clear the queue of regular events
      this.eventQueue = [];
      // early exit, no need to calculate the state
      this.currentKey = singleEvent.key as StringKeyOf<SdkSpecificStateMap>;
      this.currentStateStartTime = now;
      return this.uiStateMap[
        singleEvent.key
      ] as SdkSpecificStateMap[StringKeyOf<SdkSpecificStateMap>];
    }

    // place new event on stack
    this.eventQueue.push(uiStateEvent);

    // set up the scoreboard for current stack iteration
    this.scoreBoard = {};

    // start iterating from the oldest events
    this.eventQueue.forEach((eventInQueue) => {
      // delete and skip events outside of time window
      if (now - eventInQueue.timeStamp > this.timeWindow) {
        this.eventQueue.shift();
        return;
      }

      const relativeTime = eventInQueue.timeStamp / now;

      // Decay weight based on time, not only index.
      eventInQueue.currentWeight *= this.decayRate * relativeTime;

      // prefill board
      if (!this.scoreBoard[eventInQueue.key]) {
        this.scoreBoard[eventInQueue.key] = [];
      }

      // push the score on the current track
      this.scoreBoard[eventInQueue.key]!.push(eventInQueue.currentWeight); // we know it's not empty
    });

    // Return same state if under minimum duration
    if (!this.canShowNewUiState()) {
      return this.uiStateMap[this.currentKey];
    }

    // Otherwise calculate new UI state

    // We use this record to sum individual tracks
    this.summedScores = {};

    // score board is full, pick a winning state
    for (const trackKey in this.scoreBoard) {
      const track = this.scoreBoard[trackKey];

      if (!track) {
        throw new Error("no track - SHOULD NOT HAPPEN");
      }

      if (!this.scoreBoard[trackKey]) {
        throw new Error("no score board for key");
      }

      // TODO: See if relative amount makes sense
      const relativeAmount = track.length / this.eventQueue.length;

      const summedTrackScores = this.scoreBoard[trackKey].reduce(
        (partialSum, a) => partialSum + a,
        0,
      );

      this.summedScores[trackKey] = summedTrackScores * relativeAmount;
    }

    // TODO: this sometimes fails with 0 keys - inspect!
    if (Object.keys(this.summedScores).length === 0) {
      return this.uiStateMap[this.currentKey];
    }

    const winningKey = getKeyWithHighestValue(
      this.summedScores as Record<StringKeyOf<SdkSpecificStateMap>, number>,
    );

    const winningState = this.uiStateMap[winningKey];

    // start tracking time if it's a different state
    if (winningState.key !== this.currentKey) {
      this.currentKey = winningKey;
      this.currentStateStartTime = now;
    }

    return winningState;
  }
}
