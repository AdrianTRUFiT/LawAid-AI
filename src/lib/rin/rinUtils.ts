import type {
  RinAccessScope,
  RinActionState,
  RinBin,
  RinLegalBucket,
  RinReadability,
  RinRecordType,
  RinSourceClass,
  RinSourceKind,
  RinVerificationState,
} from '../../types/rin';

const EMAIL_EXTENSIONS = new Set(['eml', 'msg']);
const TEXT_EXTENSIONS = new Set(['txt', 'md', 'json', 'csv']);
const PDF_EXTENSIONS = new Set(['pdf']);
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp']);
const DOC_EXTENSIONS = new Set(['doc', 'docx']);
const SHEET_EXTENSIONS = new Set(['xls', 'xlsx']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'm4a']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'avi']);

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function getRecordType(extension: string): RinRecordType {
  if (EMAIL_EXTENSIONS.has(extension)) return 'email';
  if (TEXT_EXTENSIONS.has(extension)) return extension === 'json' ? 'json' : extension === 'csv' ? 'csv' : 'text';
  if (PDF_EXTENSIONS.has(extension)) return 'pdf';
  if (IMAGE_EXTENSIONS.has(extension)) return 'image';
  if (DOC_EXTENSIONS.has(extension)) return 'doc';
  if (SHEET_EXTENSIONS.has(extension)) return 'spreadsheet';
  if (AUDIO_EXTENSIONS.has(extension)) return 'audio';
  if (VIDEO_EXTENSIONS.has(extension)) return 'video';
  return 'unknown';
}

export function getMimeType(extension: string): string {
  const map: Record<string, string> = {
    eml: 'message/rfc822',
    msg: 'application/vnd.ms-outlook',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    csv: 'text/csv',
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    m4a: 'audio/mp4',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
  };
  return map[extension] ?? 'application/octet-stream';
}

export function isDirectlyReadable(recordType: RinRecordType): boolean {
  return recordType === 'email' || recordType === 'text' || recordType === 'json' || recordType === 'csv';
}

export function getReadability(recordType: RinRecordType): RinReadability {
  if (isDirectlyReadable(recordType)) return 'readable';
  if (
    recordType === 'pdf' ||
    recordType === 'image' ||
    recordType === 'doc' ||
    recordType === 'spreadsheet' ||
    recordType === 'audio' ||
    recordType === 'video'
  ) {
    return 'metadata_only';
  }
  return 'unreadable';
}

export function getInitialBin(recordType: RinRecordType, readability: RinReadability): RinBin {
  if (recordType === 'email') return 'email_structured';
  if (recordType === 'text' || recordType === 'json' || recordType === 'csv') return 'text_structured';
  if (recordType === 'pdf') return readability === 'readable' ? 'pdf_readable' : 'pdf_unreadable';
  if (recordType === 'image') return 'image_needs_review';
  if (recordType === 'doc' || recordType === 'spreadsheet') return 'office_doc_needs_review';
  if (recordType === 'audio') return 'audio_needs_review';
  if (recordType === 'video') return 'video_needs_review';
  return 'unknown';
}

export function defaultVerificationState(): RinVerificationState {
  return 'rin_tagged';
}

export function defaultAccessScope(): RinAccessScope {
  return 'private_user';
}

export function defaultSourceClass(): RinSourceClass {
  return 'human_uploaded';
}

export function defaultSourceKind(): RinSourceKind {
  return 'zip_import';
}

export function extractPeople(text: string): string[] {
  const matches = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) ?? [];
  return [...new Set(matches)].slice(0, 30);
}

export function extractOrganizations(text: string): string[] {
  const patterns = [
    /[A-Z][A-Za-z&.\s]+(?:LLP|LLC|Inc|Firm|Court|School|Hospital)/g,
    /Roberts Family Law/g,
  ];
  const out = new Set<string>();
  for (const pattern of patterns) {
    const matches = text.match(pattern) ?? [];
    for (const match of matches) out.add(match.trim());
  }
  return [...out].slice(0, 20);
}

export function extractDate(text: string): string | null {
  const patterns = [
    /\b(\d{4}-\d{2}-\d{2})\b/,
    /\b(\d{1,2}\/\d{1,2}\/\d{4})\b/,
    /\b([A-Z][a-z]{2,8}\s+\d{1,2},\s+\d{4})\b/,
    /\b(\d{1,2}\/\d{1,2}\/\d{2})\b/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function extractSubject(text: string, fileName: string): string {
  const subjectMatch = text.match(/^Subject:\s*(.+)$/im);
  if (subjectMatch?.[1]) return subjectMatch[1].trim();
  return fileName;
}

export function detectLegalBucket(text: string, fileName: string): RinLegalBucket {
  const hay = `${fileName} ${text}`.toLowerCase();

  if (/(lawyer|attorney|counsel|consultation|retainer|mycase|firm|esq)/.test(hay)) return 'counsel_communication';
  if (/(motion|petition|order|notice|filing|hearing|trial|court|judge)/.test(hay)) return 'court_filing';
  if (/(invoice|payment|alimony|support|expense|bank|tuition|fee|financial)/.test(hay)) return 'financial';
  if (/(parenting|timesharing|pickup|dropoff|child|children|custody|visit)/.test(hay)) return 'parenting';
  if (/(medical|doctor|hospital|diagnosis|arthritis|treatment|health)/.test(hay)) return 'medical';
  if (/(school|teacher|grade|attendance|activity|extracurricular)/.test(hay)) return 'school';
  if (/(witness|testimony|deposition)/.test(hay)) return 'witness';
  if (/(opposition|opposing|respondent|petitioner|plaintiff|defendant)/.test(hay)) return 'opposition';
  if (/(settlement|mediation|offer|proposal)/.test(hay)) return 'settlement';
  if (/(timeline|chronology|served|event)/.test(hay)) return 'timeline';
  if (/(evidence|exhibit|proof|attachment|recording|photo)/.test(hay)) return 'evidence';

  return 'unknown';
}

export function detectSubBucket(text: string, fileName: string, bucket: RinLegalBucket): string {
  const hay = `${fileName} ${text}`.toLowerCase();

  switch (bucket) {
    case 'counsel_communication':
      if (/consultation/.test(hay)) return 'consultation';
      if (/fee|invoice|waive/.test(hay)) return 'fee_issue';
      if (/schedule|reschedule|availability/.test(hay)) return 'scheduling';
      if (/withdraw|fire|terminate/.test(hay)) return 'relationship_change';
      return 'general_counsel_communication';
    case 'court_filing':
      if (/order/.test(hay)) return 'order';
      if (/motion/.test(hay)) return 'motion';
      if (/notice/.test(hay)) return 'notice';
      return 'general_court_filing';
    case 'parenting':
      if (/pickup|dropoff/.test(hay)) return 'transportation';
      if (/visit|timesharing/.test(hay)) return 'timesharing';
      return 'general_parenting';
    case 'financial':
      if (/invoice/.test(hay)) return 'invoice';
      if (/support|alimony/.test(hay)) return 'support';
      return 'general_financial';
    default:
      return `general_${bucket}`;
  }
}

export function detectIssues(text: string, fileName: string): string[] {
  const hay = `${fileName} ${text}`.toLowerCase();
  const out = new Set<string>();

  if (/fee|waive|invoice/.test(hay)) out.add('attorney_fee_issue');
  if (/reschedule|availability|schedule/.test(hay)) out.add('scheduling_issue');
  if (/deadline|hearing|trial|due/.test(hay)) out.add('deadline');
  if (/delay|waiting|follow up|follow-up/.test(hay)) out.add('possible_delay');
  if (/warning|concern|issue/.test(hay)) out.add('warning_sign');
  if (/admit|admission|i missed/.test(hay)) out.add('admission');
  if (/promise|i will|i can/.test(hay)) out.add('promise');
  if (/served|first contacted|initial/.test(hay)) out.add('timeline_anchor');
  if (/judge|court/.test(hay)) out.add('court_reference');
  if (/child|children/.test(hay)) out.add('child_reference');

  return [...out];
}

export function detectEvents(text: string): string[] {
  const hay = text.toLowerCase();
  const out = new Set<string>();

  if (/served/.test(hay)) out.add('service_event');
  if (/reschedule/.test(hay)) out.add('reschedule_event');
  if (/consultation/.test(hay)) out.add('consultation_event');
  if (/hearing/.test(hay)) out.add('hearing_event');
  if (/trial/.test(hay)) out.add('trial_event');

  return [...out];
}

export function detectActionFlags(text: string, issues: string[]): string[] {
  const hay = text.toLowerCase();
  const out = new Set<string>();

  if (/please|can you|would you|let me know/.test(hay)) out.add('action_requested');
  if (/i will|we can|scheduled|completed/.test(hay)) out.add('action_taken_signal');
  if (issues.includes('timeline_anchor')) out.add('timeline_candidate');
  if (issues.includes('admission')) out.add('possible_exhibit');
  if (issues.includes('warning_sign')) out.add('review_for_pattern');

  return [...out];
}

export function createSummary(text: string, fileName: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return `File: ${fileName}`;
  return cleaned.slice(0, 220);
}

export function decideImportance(bucket: RinLegalBucket, issues: string[]): 'low' | 'medium' | 'high' {
  if (bucket === 'court_filing' || bucket === 'counsel_communication') return 'high';
  if (issues.includes('deadline') || issues.includes('timeline_anchor')) return 'high';
  if (bucket === 'financial' || bucket === 'parenting' || issues.length > 0) return 'medium';
  return 'low';
}

export function decideProofStatus(
  recordType: RinRecordType,
  readability: RinReadability,
  issues: string[],
): 'weak' | 'possible' | 'strong' | 'unknown' {
  if (recordType === 'email' && readability === 'readable') return 'strong';
  if (recordType === 'pdf' && readability !== 'unreadable') return 'possible';
  if (issues.includes('admission') || issues.includes('timeline_anchor')) return 'possible';
  if (readability === 'unreadable') return 'unknown';
  return 'weak';
}

export function decideNextAction(
  readability: RinReadability,
  bucket: RinLegalBucket,
  proofStatus: 'weak' | 'possible' | 'strong' | 'unknown',
): RinActionState {
  if (readability === 'unreadable') return 'hold';
  if (bucket === 'timeline') return 'timeline';
  if (bucket === 'evidence' || proofStatus === 'strong') return 'review';
  if (bucket === 'court_filing') return 'review';
  return 'review';
}

export function buildSearchText(params: {
  fileName: string;
  subject: string;
  summary: string;
  bucket: RinLegalBucket;
  subBucket: string;
  people: string[];
  organizations: string[];
  issues: string[];
  events: string[];
  rawText: string;
}): string {
  return [
    params.fileName,
    params.subject,
    params.summary,
    params.bucket,
    params.subBucket,
    ...params.people,
    ...params.organizations,
    ...params.issues,
    ...params.events,
    params.rawText,
  ]
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}
