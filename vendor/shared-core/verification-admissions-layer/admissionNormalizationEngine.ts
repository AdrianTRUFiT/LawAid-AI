export function normalizeAdmissionText(text: string): string {
  return text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, "  ")
    .replace(/[ \u00A0]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
