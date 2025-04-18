// file size inspection
// import Sonda from "sonda/vite";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import { getPackagePath, linkResources } from "@microblink/utils";
import { echo, fs } from "zx";

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: "es2022",
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkid",
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
        ranOnce = true;
      },
    },
  ],
}));

let ranOnce = false;
type Dependency = keyof typeof dependencies;

async function moveBlinkIdResources() {
  const packageName: Dependency = "@microblink/blinkid-core";
  const pkgPath = getPackagePath(packageName);
  const distPath = `${pkgPath}/dist/resources`;
  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(`public/resources`);

  for (const path of files) {
    await linkResources(`${distPath}/${path}`, `public/resources/${path}`);
  }
}
