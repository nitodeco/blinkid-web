# BlinkID Next

This is an all-in-one package intended for simpler use cases. It includes everything you need to get started with BlinkID:

- `@microblink/blinkid-core` - core scanning functionality
- `@microblink/blinkid-ux-manager` - user experience and feedback
- `@microblink/camera-manager` - camera handling

## Installation

```bash
npm install @microblink/blinkid
```

## Usage

```typescript
import { createBlinkIdUi } from "@microblink/blinkid";

const blinkId = await createBlinkIdUi({
  licenseKey: "your-license-key",
  targetNode: document.getElementById("container"),
});

// Add result callback
blinkId.addOnResultCallback((result) => {
  console.log("Scanning result:", result);
});
```

For more details on setup requirements and advanced usage, check out the documentation at https://github.com/BlinkID/blinkid-web
