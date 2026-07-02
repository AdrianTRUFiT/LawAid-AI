import fs from 'fs';
import path from 'path';
import { ExportUnlockProof, TrialToPaidTransition } from './paidActivationContracts';

const HB_ROOT = 'D:/DEV/AIVA/homebase';
const PROOF_ROOT = path.join(HB_ROOT, 'ACTIVATION_PROOFS', 'LAWAIDAI');

export type PersistedUnlockProof = {
  status: 'LWI_EXPORT_UNLOCK_PROOF_WRITTEN';
  proofPath: string;
  transitionPath: string;
};

export function writeExportUnlockProof(
  proof: ExportUnlockProof,
  transition: TrialToPaidTransition
): PersistedUnlockProof {
  fs.mkdirSync(PROOF_ROOT, { recursive: true });

  const folder = path.join(PROOF_ROOT, proof.proofId);
  fs.mkdirSync(folder, { recursive: true });

  const proofPath = path.join(folder, 'export-unlock-proof.json');
  const transitionPath = path.join(folder, 'trial-to-paid-transition.json');

  fs.writeFileSync(proofPath, JSON.stringify(proof, null, 2), 'utf8');
  fs.writeFileSync(transitionPath, JSON.stringify(transition, null, 2), 'utf8');

  return {
    status: 'LWI_EXPORT_UNLOCK_PROOF_WRITTEN',
    proofPath: proofPath.replace(/\\/g, '/'),
    transitionPath: transitionPath.replace(/\\/g, '/')
  };
}
