export function requiresReview(content: string): boolean {
  const text = content.toLowerCase();

  const reviewTriggers = [
    'authorship',
    'ownership',
    'governance',
    'boundary',
    'doctrine',
    'authority',
    'legal',
    'court',
    'policy',
    'bias',
    'faircode',
    'child initiative'
  ];

  return reviewTriggers.some(trigger => text.includes(trigger));
}
