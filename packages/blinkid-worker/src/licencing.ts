/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

import {
  LicenseUnlockResult,
  LicenseRequest,
  LicenseStatusResponse,
} from "@microblink/blinkid-wasm";

function constructLicenseRequest(
  unlockResult: LicenseUnlockResult,
): LicenseRequest {
  return {
    licenseId: unlockResult.licenseId,
    licensee: unlockResult.licensee,
    applicationIds: unlockResult.applicationIds,
    packageName: unlockResult.packageName,
    platform: "Browser",
    sdkName: unlockResult.sdkName,
    sdkVersion: unlockResult.sdkVersion,
  };
}

export async function obtainNewServerPermission(
  unlockResult: LicenseUnlockResult,
) {
  try {
    const response = await fetch(
      "https://baltazar.microblink.com/api/v2/status/check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-cache",
        body: JSON.stringify(constructLicenseRequest(unlockResult)),
      },
    );

    const serverPermission = (await response.json()) as LicenseStatusResponse;
    return serverPermission;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
