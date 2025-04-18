/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import { Rectangle } from "../../utils";
import { ScanningSide } from "../ScanningSide";

/**
 * Represents the result of the image crop transformation with additional
 * details.
 */
export type DetailedCroppedImageResult = {
  image: ImageData;
  location?: Rectangle;
  side?: ScanningSide;
};
