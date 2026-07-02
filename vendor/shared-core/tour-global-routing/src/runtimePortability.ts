import { RuntimePortabilityProfile } from "./tourContracts";

const supportedDevices = new Set([
  "WINDOWS_PC",
  "MAC",
  "IOS_PHONE",
  "IPAD",
  "ANDROID_PHONE",
  "ANDROID_TABLET",
  "MOBILE_BROWSER",
  "PWA",
  "FUTURE_DEVICE",
]);

export function isSupportedDevice(runtime: RuntimePortabilityProfile): boolean {
  return supportedDevices.has(runtime.deviceClass);
}

export function isPortableRuntime(runtime: RuntimePortabilityProfile): boolean {
  if (runtime.osBound) return false;
  if (runtime.absolutePathRequired) return false;
  if (!runtime.supportsRelativePaths) return false;

  return true;
}
