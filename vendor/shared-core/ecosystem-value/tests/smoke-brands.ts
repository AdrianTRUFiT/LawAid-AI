import {
  createPaiSafeWalletManifest,
  createTruFitDigitalLockboxManifest,
} from "../src/index.js";

const pai = createPaiSafeWalletManifest();
const tdl = createTruFitDigitalLockboxManifest();

if (!pai.usesWalletLayer || pai.usesLockboxLayer) {
  throw new Error("PAI-SAFE manifest is invalid.");
}

if (!tdl.usesWalletLayer || !tdl.usesLockboxLayer) {
  throw new Error("TRUFiT Digital Lockbox manifest is invalid.");
}

console.log("SMOKE_SHARED_VALUE_BRANDS=PASS");
