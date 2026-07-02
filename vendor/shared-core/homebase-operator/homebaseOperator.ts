import fs from 'fs';
import path from 'path';
import { intakeToMarkdownAndKnowledge } from '../universal-intake-md/runtimeBridge';
import { overrideReviewStatus } from '../universal-intake-md/reviewOverride';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  inbox: path.join(HB_ROOT, 'INBOX'),
  processing: path.join(HB_ROOT, 'PROCESSING'),
  processed: path.join(HB_ROOT, 'PROCESSED'),
  review: path.join(HB_ROOT, 'REVIEW')
};

function moveFile(src: string, dest: string) {
  fs.renameSync(src, dest);
}

function readInboxFiles() {
  return fs.readdirSync(PATHS.inbox)
    .filter(f => f.endsWith('.txt') || f.endsWith('.md'));
}

export function runHomebaseIntake() {
  const files = readInboxFiles();

  if (files.length === 0) {
    console.log('HB-SOS: NO FILES IN INBOX');
    return;
  }

  for (const file of files) {
    const inboxPath = path.join(PATHS.inbox, file);
    const processingPath = path.join(PATHS.processing, file);

    moveFile(inboxPath, processingPath);

    const raw = fs.readFileSync(processingPath, 'utf8');

    const result = intakeToMarkdownAndKnowledge({
      inputType: 'uploaded_file_text',
      title: file,
      body: raw,
      submittedBy: 'HB-SOS',
      entryMode: 'PAID',
      sourceLabel: 'HB-INBOX'
    });

    // ?? APPLY REVIEW LOGIC HERE
    result.knowledge.entry = overrideReviewStatus(
      result.knowledge.entry,
      raw
    );

    const finalName = path.basename(result.mdArtifact.markdownPath);
    const finalPath = path.join(PATHS.processed, finalName);

    fs.copyFileSync(result.mdArtifact.markdownPath, finalPath);

    if (result.knowledge.entry.reviewStatus === 'NEEDS_REVIEW') {
      const reviewPath = path.join(PATHS.review, finalName);
      fs.copyFileSync(result.mdArtifact.markdownPath, reviewPath);

      console.log('HB-SOS REVIEW FLAGGED:', file);
    }

    fs.unlinkSync(processingPath);

    console.log('HB-SOS PROCESSED:', file);
  }
}
