import * as crypto from "node:crypto";

export function fingerprintSignal(raw: string): string {
  return crypto
    .createHash("sha256")
    .update(
      raw
        .replace(/^\uFEFF/, "")
        .replace(/^---[\s\S]*?---/, "")
        .replace(/\r\n/g, "\n")
        .trim(),
      "utf8"
    )
    .digest("hex");
}
