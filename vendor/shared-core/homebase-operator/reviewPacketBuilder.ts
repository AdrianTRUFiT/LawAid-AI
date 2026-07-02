import fs from 'fs';
import path from 'path';

const HB_ROOT = 'D:/DEV/AIVA/homebase';

const PATHS = {
  review: path.join(HB_ROOT, 'REVIEW'),
  processed: path.join(HB_ROOT, 'PROCESSED'),
  packets: path.join(HB_ROOT, 'INDEX', 'review-packets')
};

if (!fs.existsSync(PATHS.packets)) {
  fs.mkdirSync(PATHS.packets, { recursive: true });
}

function readReviewFiles() {
  return fs.readdirSync(PATHS.review)
    .filter(f => f.endsWith('.md'));
}

function extractSections(content: string) {
  const lines = content.split('\n');

  let title = '';
  let routing: string[] = [];
  let requiresReview = false;

  for (const line of lines) {
    if (!title && line.startsWith('#')) {
      title = line.replace('#', '').trim();
    }

    if (line.toLowerCase().includes('review requirement')) {
      requiresReview = true;
    }

    if (line.toLowerCase().includes('routing')) {
      requiresReview = true;
    }

    if (line.startsWith('- ')) {
      routing.push(line.replace('- ', '').trim());
    }
  }

  return {
    title,
    routing,
    requiresReview
  };
}

export function buildReviewPackets() {
  const files = readReviewFiles();

  if (files.length === 0) {
    console.log('REVIEW PACKETS: NONE FOUND');
    return;
  }

  for (const file of files) {
    const filePath = path.join(PATHS.review, file);
    const raw = fs.readFileSync(filePath, 'utf8');

    const meta = extractSections(raw);

    const packet = {
      file,
      createdAt: new Date().toISOString(),
      title: meta.title,
      requiresReview: meta.requiresReview,
      routing: meta.routing,
      status: 'PENDING_REVIEW'
    };

    const outName = file.replace('.md', '-packet.json');
    const outPath = path.join(PATHS.packets, outName);

    fs.writeFileSync(outPath, JSON.stringify(packet, null, 2));

    console.log('REVIEW PACKET BUILT:', outName);
  }
}
