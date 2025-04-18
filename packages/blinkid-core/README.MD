# BlinkID Core

`@microblink/blinkid-core` provides the core BlinkID functionality.

## Before you start

`@microblink/blinkid-core` is a part of `@microblink/blinkid`. All packages in the monorepo (TODO: add link) are currently in a prerelease stage.

## Quick start

See the example apps in the `apps/examples` directory in the github repository (TODO: link)

## Installation

`blinkid-core` is available on the npm registry and can be installed using a package manager:

```sh
npm install @microblink/blinkid-core # or yarn or pnpm
```

## Environment & Setup

BlinkID Core is an ESM-only published package for use in browsers using a bundler such as Vite, or by including them directly via [`<script type="module">`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules#applying_the_module_to_your_html) in your HTML.

Alternatively, you can use it via [esm.sh](https://esm.sh/) that allows you to import JavaScript modules from http URLs without a build step.

If used in the `blinkid-monorepo` from github, read the usage instructions in its root (TODO: link).

### Licence key

In order to use BlinkID, you need to have a valid licence key. You can request a free trial license key, after you register, at [Microblink Developer Hub](https://account.microblink.com/signin).

### Hosting the neccessary resources

In order to use BlinkID Core, you need to host the accompanying resources directory, without modifying it. It can be found in `dist/resources` in this package. It contains the following, in 6 different builds:

- The WebAssembly `.wasm` and `.data` files
- Supporting Emscripten code
- `@microblink/blinkid-worker` Web Worker

### Hosting requirements

BlinkID Core needs to be run in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) in order to work.

Additionally, to use the multithreaded build, your website also must be cross-origin isolated. This can be achieved by placing the following headers on your website:

```
"Cross-Origin-Embedder-Policy": "require-corp",
"Cross-Origin-Opener-Policy": "same-origin",
```

For more details, check out https://web.dev/articles/why-coop-coep

## Usage

`blinkid-core` is a low-level API used as a part of the browser SDK. See the example for usage.
