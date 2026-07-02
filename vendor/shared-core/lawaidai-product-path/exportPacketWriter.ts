import fs from 'fs';
import path from 'path';
import { LawAidAIWorkspace } from './casePathContracts';
import { buildExportPacketManifest } from './exportPacketBuilder';

const HB_ROOT = 'D:/DEV/AIVA/homebase';
const EXPORT_ROOT = path.join(HB_ROOT, 'EXPORTS', 'LAWAIDAI');

export type PersistedPacketOutput = {
  status: 'LWI_EXPORT_PACKET_WRITTEN';
  manifestPath: string;
  attorneyPacketPath?: string;
  personalPacketPath?: string;
};

export function writeExportPacket(workspace: LawAidAIWorkspace, mode: 'preview' | 'export'): PersistedPacketOutput {
  fs.mkdirSync(EXPORT_ROOT, { recursive: true });

  const result = buildExportPacketManifest(workspace, mode);
  const folder = path.join(EXPORT_ROOT, result.manifest.packetId);

  fs.mkdirSync(folder, { recursive: true });

  const manifestPath = path.join(folder, 'export-packet-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(result.manifest, null, 2), 'utf8');

  let attorneyPacketPath: string | undefined;
  let personalPacketPath: string | undefined;

  if (result.attorneyPacket) {
    attorneyPacketPath = path.join(folder, 'attorney-handoff-packet.json');
    fs.writeFileSync(attorneyPacketPath, JSON.stringify(result.attorneyPacket, null, 2), 'utf8');
  }

  if (result.personalPacket) {
    personalPacketPath = path.join(folder, 'personal-readiness-packet.json');
    fs.writeFileSync(personalPacketPath, JSON.stringify(result.personalPacket, null, 2), 'utf8');
  }

  return {
    status: 'LWI_EXPORT_PACKET_WRITTEN',
    manifestPath: manifestPath.replace(/\\/g, '/'),
    attorneyPacketPath: attorneyPacketPath?.replace(/\\/g, '/'),
    personalPacketPath: personalPacketPath?.replace(/\\/g, '/')
  };
}
