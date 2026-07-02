import { useMemo, useState } from 'react';
import type { RinDecodeResult, RinSearchFilter } from '../../types/rin';
import { runRinOnZip } from '../../lib/rin/rinDecoder';
import { appendRinDecodeResult, clearRinStore, loadRinStore } from '../../lib/rin/rinStore';
import { searchRinRecords } from '../../lib/rin/rinSearch';

type Props = {
  matterId: string;
};

export function RinWorkbench({ matterId }: Props) {
  const [result, setResult] = useState<RinDecodeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [excludeOrg, setExcludeOrg] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);

  const store = useMemo(() => loadRinStore(), [storeVersion]);

  async function handleZip(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsLoading(true);

    try {
      const decoded = await runRinOnZip(file, matterId);
      appendRinDecodeResult(decoded);
      setResult(decoded);
      setStoreVersion((v) => v + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process archive');
    } finally {
      setIsLoading(false);
    }
  }

  const filter: RinSearchFilter = {
    matter_id: matterId,
    exclude_organizations: excludeOrg ? [excludeOrg] : [],
    include_llm: false,
    include_search_derived: false,
    only_verified: onlyVerified,
  };

  const searchResults = query.trim()
    ? searchRinRecords(query, store.records, store.identities, filter).slice(0, 50)
    : [];

  const bucketCounts = store.records.reduce<Record<string, number>>((acc, record) => {
    const key = `${record.legal_bucket} / ${record.sub_bucket}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6 rounded-xl border p-4">
      <div>
        <h2 className="text-xl font-semibold">Case File Optimizer</h2>
        <p className="text-sm opacity-80">
          Import, organize, and search your case materials in one place.
Powered by RIN: Record Intake Normalizer.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input type="file" accept=".zip" onChange={handleZip} />
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm"
          onClick={() => {
            clearRinStore();
            setResult(null);
            setStoreVersion((v) => v + 1);
          }}
        >
          Clear Store
        </button>
      </div>

      {isLoading && <p className="text-sm">Processing archive through RIN...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Intakes" value={store.intakes.length} />
        <Metric label="Records" value={store.records.length} />
        <Metric label="Identities" value={store.identities.length} />
        <Metric label="Readable" value={store.records.filter((r) => r.readability === 'readable').length} />
        <Metric label="Warnings" value={store.records.filter((r) => r.possible_warning_sign).length} />
      </div>

      <div className="space-y-3 rounded border p-3">
        <h3 className="font-medium">Search</h3>
        <div className="grid gap-3 md:grid-cols-3">
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Search records, people, issues, patterns..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Exclude organization, e.g. Roberts Family Law"
            value={excludeOrg}
            onChange={(e) => setExcludeOrg(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
            />
            Only verified
          </label>
        </div>
      </div>

      {query.trim().length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Search Results</h3>
          {searchResults.length === 0 && <p className="text-sm opacity-70">No results found.</p>}
          {searchResults.map((item) => (
            <div key={item.record_id} className="rounded border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{item.file_name}</strong>
                <span>score {item.score}</span>
              </div>
              <div className="mt-1 opacity-80">{item.content_summary}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Tag text={item.legal_bucket} />
                <Tag text={item.sub_bucket} />
                <Tag text={item.importance} />
                <Tag text={item.proof_status} />
                <Tag text={item.next_action} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-medium">Bucket Summary</h3>
        <div className="space-y-1 text-sm">
          {Object.entries(bucketCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([key, count]) => (
              <div key={key} className="flex items-center justify-between rounded border px-3 py-2">
                <span>{key}</span>
                <span>{count}</span>
              </div>
            ))}
        </div>
      </div>

      {result && (
        <details className="rounded border p-3">
          <summary className="cursor-pointer font-medium">Last RIN Decode Result</summary>
          <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(result, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border p-3">
      <div className="text-xs uppercase opacity-70">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return <span className="rounded-full border px-2 py-1 text-xs">{text}</span>;
}
