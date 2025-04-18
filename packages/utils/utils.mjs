// @ts-check

import { fs } from "zx";
import pkgPath from "resolve-package-path";

export function getResourcesPath(sdk) {
  const sdkPath = getPackagePath(sdk);

  const src = `${sdkPath}/dist/resources`;

  return src;
}

/**
 *
 * @param {string} packageName name of the package
 * TODO: this function does not work when invoked from the root of the project.
 * one such example is running vitest from the root of the project.
 */
export function getPackagePath(packageName) {
  return pkgPath(packageName, ".")?.replace("/package.json", "");
}

export async function linkResources(sourcePath, destinationPath) {
  if (fs.pathExistsSync(sourcePath)) {
    try {
      await fs.ensureSymlink(sourcePath, destinationPath);
      console.log(`Symlinked files to ${destinationPath}`);
    } catch (error) {
      console.error(error);
    }
  } else {
    console.log(`${sourcePath} doesn't exist`);
  }
}
