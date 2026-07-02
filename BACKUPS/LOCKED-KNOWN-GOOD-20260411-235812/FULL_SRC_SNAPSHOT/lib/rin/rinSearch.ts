import type { RinIdentity, RinQueryResult, RinRecord, RinSearchFilter } from '../../types/rin';

function containsAny(values: string[], targets: string[]): boolean {
  const hay = values.map((v) => v.toLowerCase());
  return targets.some((target) => hay.includes(target.toLowerCase()));
}

function textIncludes(text: string, terms: string[]): boolean {
  const hay = text.toLowerCase();
  return terms.some((term) => hay.includes(term.toLowerCase()));
}

export function filterRinRecords(
  records: RinRecord[],
  identities: RinIdentity[],
  filter: RinSearchFilter,
): RinRecord[] {
  const identityMap = new Map(identities.map((i) => [i.rin_id, i]));

  return records.filter((record) => {
    const identity = identityMap.get(record.rin_id);
    if (!identity) return false;

    if (filter.matter_id && record.matter_id !== filter.matter_id) return false;
    if (filter.people?.length && !containsAny(record.people, filter.people)) return false;
    if (filter.organizations?.length && !containsAny(record.organizations, filter.organizations)) return false;
    if (filter.exclude_people?.length && containsAny(record.people, filter.exclude_people)) return false;
    if (filter.exclude_organizations?.length && containsAny(record.organizations, filter.exclude_organizations)) return false;
    if (filter.legal_buckets?.length && !filter.legal_buckets.includes(record.legal_bucket)) return false;
    if (filter.access_scope?.length && !filter.access_scope.includes(identity.access_scope)) return false;
    if (filter.verification_states?.length && !filter.verification_states.includes(identity.verification_state)) return false;
    if (filter.only_verified && identity.verification_state !== 'verified') return false;
    if (filter.include_llm === false && identity.llm_influenced) return false;
    if (filter.include_search_derived === false && identity.search_influenced) return false;
    if (filter.date_from && record.date_detected && record.date_detected < filter.date_from) return false;
    if (filter.date_to && record.date_detected && record.date_detected > filter.date_to) return false;

    return true;
  });
}

export function searchRinRecords(
  query: string,
  records: RinRecord[],
  identities: RinIdentity[],
  filter: RinSearchFilter = {},
): RinQueryResult[] {
  const filtered = filterRinRecords(records, identities, filter);
  const terms = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return filtered
    .map((record) => {
      let score = 0;

      for (const term of terms) {
        if (record.search_text.toLowerCase().includes(term)) score += 5;
        if (record.content_summary.toLowerCase().includes(term)) score += 4;
        if (record.file_name.toLowerCase().includes(term)) score += 3;
        if (record.people.some((p) => p.toLowerCase().includes(term))) score += 4;
        if (record.organizations.some((o) => o.toLowerCase().includes(term))) score += 4;
        if (record.issues_detected.some((i) => i.toLowerCase().includes(term))) score += 4;
        if (record.possible_pattern_tags.some((p) => p.toLowerCase().includes(term))) score += 3;
      }

      if (record.importance === 'high') score += 2;
      if (record.proof_status === 'strong') score += 2;
      if (record.possible_warning_sign) score += 1;

      return {
        record_id: record.record_id,
        file_name: record.file_name,
        legal_bucket: record.legal_bucket,
        sub_bucket: record.sub_bucket,
        content_summary: record.content_summary,
        people: record.people,
        date_detected: record.date_detected,
        importance: record.importance,
        proof_status: record.proof_status,
        next_action: record.next_action,
        score,
      };
    })
    .filter((r) => r.score > 0 || textIncludes(query, ['all', 'show', 'list']))
    .sort((a, b) => b.score - a.score);
}