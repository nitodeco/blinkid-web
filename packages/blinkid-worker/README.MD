# BlinkID Web Worker

The `@microblink/blinkid-worker` package handles downloading, initializing and interacting with the BlinkID WebAssembly resources.

It is not a published package, or a user-consumable package. It's included in the `/resources` directory shipped in `@microblink/blinkid-core`, which needs to be hosted by the user.

It doesn't expose the native methods present on the WebAssembly module, but wraps them in a modern API which can then be consumed by the user via `@microblink/blinkid-core`.
