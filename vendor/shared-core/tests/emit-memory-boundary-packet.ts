import fs from "fs";
import { verifyThinkBaseSoulBaseBoundary } from "../memory-boundary";

const outputPath = "D:/DEV/AIVA/shared-data/memory-boundary/thinkbase-soulbase-boundary-verification.json";

const packet = {
  generatedAt: new Date().toISOString(),
  ...verifyThinkBaseSoulBaseBoundary()
};

fs.writeFileSync(outputPath, JSON.stringify(packet, null, 2), "utf8");

console.log("MEMORY_BOUNDARY_PACKET_WRITTEN");
console.log(outputPath);










