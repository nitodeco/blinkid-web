/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { AlphabetType, Rectangle } from "../utils";
import { ScanningSide } from "./ScanningSide";

/** Represents a string result for a specific alphabet */
export type AlphabetStringResult = {
  value: string;
  location?: Rectangle;
  side?: ScanningSide;
};

/** Represents multi string results with mandatory entries for all alphabets */
export type StringResult = {
  [key in AlphabetType]: AlphabetStringResult;
};
