export class ComplianceNonceStore {
  private readonly used = new Set<string>();

  has(nonce: string): boolean {
    return this.used.has(nonce);
  }

  markUsed(nonce: string): void {
    this.used.add(nonce);
  }

  size(): number {
    return this.used.size;
  }
}