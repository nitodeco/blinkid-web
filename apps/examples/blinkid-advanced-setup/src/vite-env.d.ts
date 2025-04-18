/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LICENCE_KEY: string;
  readonly VITE_SHOW_DEBUG: string;
  readonly VITE_USE_PORTAL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
