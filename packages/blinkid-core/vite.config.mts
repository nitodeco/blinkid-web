import { getPackagePath, linkResources } from "@microblink/utils";
import { stripIndents } from "common-tags";
import { defineConfig } from "vite";
import { fs } from "zx";
import { dependencies } from "./package.json";

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: "es2022",
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkid-core",
    },
  },
  plugins: [
    {
      name: "move-resources",
      buildStart: async () => {
        if (ranOnce) {
          return;
        }
        await moveBlinkIdResources();
        await moveWorker();
        await writeResourceDoc();
        ranOnce = true;
      },
    },
  ],
}));

let ranOnce = false;

type Dependency = keyof typeof dependencies;

async function writeResourceDoc() {
  fs.outputFile(
    "public/resources/DO_NOT_MODIFY_THIS_DIRECTORY.md",
    stripIndents`
      Do not modify the name of this directory, or the files inside it.
      The Wasm and Web Workers will look for the \`resources\` directory on the path.`,
  );
}

async function moveWorker() {
  const packageName: Dependency = "@microblink/blinkid-worker";
  const pkgPath = getPackagePath(packageName);
  const distPath = `${pkgPath}/dist`;
  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(`public/resources`);

  for (const path of files) {
    await linkResources(`${distPath}/${path}`, `public/resources/${path}`);
  }
}

async function moveBlinkIdResources() {
  const packageName: Dependency = "@microblink/blinkid-wasm";
  const pkgPath = getPackagePath(packageName);
  const distPath = `${pkgPath}/dist`;
  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(`public/resources`);

  for (const path of files) {
    await linkResources(`${distPath}/${path}`, `public/resources/${path}`);
  }
}
