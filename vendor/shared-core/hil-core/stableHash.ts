import crypto from 'crypto';

export function stableHash(input: any) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(input))
    .digest("hex");
}
