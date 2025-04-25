# @microblink/blinkid-ux-manager

This package provides user experience management and feedback UI for the BlinkID browser SDK. It parses results from [`@microblink/blinkid-core`](https://www.npmjs.com/package/@microblink/blinkid-core) and guides the user through the scanning process, controlling [`@microblink/camera-manager`](https://www.npmjs.com/package/@microblink/camera-manager) as needed.

## Overview

- Provides both headless and UI components for user feedback during scanning.
- Integrates with BlinkID Core and Camera Manager.
- Used by [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid) and can be used directly for custom UI integrations.

## Installation

Install from npm using your preferred package manager:

```sh
npm install @microblink/blinkid-ux-manager
# or
yarn add @microblink/blinkid-ux-manager
# or
pnpm add @microblink/blinkid-ux-manager
```

## Usage

You can use `@microblink/blinkid-ux-manager` directly in your project for advanced or custom integrations. For most use cases, use [`@microblink/blinkid`](https://www.npmjs.com/package/@microblink/blinkid) for a simpler setup.

See the example apps in the `apps/examples` directory in the GitHub repository for usage details.

## Development

To build the package locally:

1. Install dependencies in the monorepo root:

   ```sh
   pnpm install
   ```

2. Build the package:

   ```sh
   pnpm build
   ```

The output files will be available in the `dist/` and `types/` directories.
