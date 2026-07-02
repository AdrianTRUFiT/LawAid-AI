import crypto from 'crypto';

export function sha(input: any) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export function makeId(prefix: string, input: any) {
  return prefix + '-' + sha({ input, now: Date.now() }).slice(0, 14);
}

export function safeFileName(input: string) {
  return input
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'untitled';
}
