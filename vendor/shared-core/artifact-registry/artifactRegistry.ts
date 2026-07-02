import fs from 'fs';
import path from 'path';

const registryDir = "D:/DEV/AIVA/shared-data/artifacts";

function ensureDir() {
  fs.mkdirSync(registryDir, { recursive: true });
}

export function registerArtifact(input: {
  artifactId: string;
  soulmark?: string;
  type: string;
}) {
  ensureDir();

  const record = {
    artifactId: input.artifactId,
    soulmark: input.soulmark || null,
    type: input.type,
    status: "ACTIVE",
    createdAt: Date.now(),
    lastVerifiedAt: Date.now()
  };

  const file = path.join(registryDir, input.artifactId + ".json");
  fs.writeFileSync(file, JSON.stringify(record, null, 2));

  return record;
}

export function getArtifact(artifactId: string) {
  const file = path.join(registryDir, artifactId + ".json");
  if (!fs.existsSync(file)) return null;

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function invalidateArtifact(artifactId: string) {
  const file = path.join(registryDir, artifactId + ".json");
  if (!fs.existsSync(file)) return null;

  const record = JSON.parse(fs.readFileSync(file, "utf8"));
  record.status = "INVALID";
  record.invalidatedAt = Date.now();

  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return record;
}
