/**
 * Copyright (c) 2025 Microblink Ltd. All rights reserved.
 */

export type LicenseUnlockResult = Readonly<{
  isTrial: boolean;
  hasPing: boolean;
  licenseId: string;
  licensee: string;
  applicationIds: Array<string>;
  packageName: string;
  sdkName: string;
  sdkVersion: string;
  unlockResult: LicenseTokenState;
  licenseError: string;
}>;

export type LicenseTokenState =
  | "invalid"
  | "requires-server-permission"
  | "valid";

export type LicenseRequest = Readonly<{
  licenseId: string;
  licensee: string;
  applicationIds: Array<string>;
  packageName: string;
  platform: string;
  sdkName: string;
  sdkVersion: string;
}>;

export type LicenseStatusResponse = Record<string, string>;

export type ServerPermissionSubmitResult = Readonly<{
  status: ServerPermissionSubmitResultStatus;
  lease: number;
  networkErrorDescription?: string;
}>;

export type ServerPermissionSubmitResultStatus =
  | "ok"
  | "network-error"
  | "remote-lock"
  | "permission-expired"
  | "payload-corrupted"
  | "payload-signature-verification-failed"
  | "incorrect-token-state"
  | "detected-skewed-clock";