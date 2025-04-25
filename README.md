# BlinkID Browser

This project is set up as a monorepo. The SDK is split into multiple packages, located inside the `/packages` directory.

## Required tools:

1. NodeJS LTS

   - Prefer using [`nvm`](https://github.com/nvm-sh/nvm) on dev machines:

   ```sh
   nvm install --lts
   nvm use --lts
   ```

   - [alternative installation methods](https://nodejs.org/en/download)

2. `pnpm`

   - alternative package manager to `npm`
   - easiest to install using `npm install -g pnpm`
   - [alternative installation methods](https://pnpm.io/installation)

## Installation instructions:

Install packages:

```sh
pnpm install
```

Install necessary conan packages:

```sh
pnpm conan-install
```

Run the build process, this will configure and build all the packages in the monorepo:

```sh
pnpm build
```

To run an example app, navigate to any of the examples in `/apps/` and run:

```sh
pnpm dev
```

To run the app on your local network use:

```sh
pnpm dev --host
```

To run the example apps, you will need a licence key and place it in the `.env` file.

Additionally, each package can be built individually by navigating to its folder and running the corresponding scripts.

## Published packages

Published packages can be found here:

- https://www.npmjs.com/package/@microblink/blinkid
- https://www.npmjs.com/package/@microblink/blinkid-core
- https://www.npmjs.com/package/@microblink/blinkid-ux-manager
- https://www.npmjs.com/package/@microblink/camera-manager
