import React, { useMemo, useRef, useState } from 'react';
import type { RinDecodeResult, RinRecord, RinSearchFilter } from '../../types/rin';
import { runRinOnZip } from '../../lib/rin/rinDecoder';
import { appendRinDecodeResult, clearRinStore, loadRinStore } from '../../lib/rin/rinStore';
import { searchRinRecords } from '../../lib/rin/rinSearch';

type Props = {
  matterId: string;
};

export function RinWorkbench({ matterId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [result, setResult] = useState<RinDecodeResult | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [excludeOrg, setExcludeOrg] = useState('');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [storeVersion, setStoreVersion] = useState(0);

  const store = useMemo(() => loadRinStore(), [storeVersion]);

  const matterIntakes = useMemo(() => {
    return store.intakes.filter((intake: any) => intake.matter_id === matterId);
  }, [store.intakes, matterId]);

  const matterRecords = useMemo(() => {
    return store.records.filter((record: any) => record.matter_id === matterId);
  }, [store.records, matterId]);

  const matterIdentities = useMemo(() => {
    return store.identities.filter((identity: any) => identity.matter_id === matterId);
  }, [store.identities, matterId]);

  async function handleZip(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setSelectedFileName(file.name);
    setIsLoading(true);

    try {
      console.log('RIN handleZip fired', file.name, matterId);

      const decoded = await runRinOnZip(file, matterId);
      console.log('RIN decoded result:', decoded);

      const nextStore = appendRinDecodeResult(decoded);
      console.log('RIN store after append:', nextStore);

      setResult(decoded);
      setStoreVersion((v) => v + 1);
    } catch (err) {
      console.error('RIN handleZip error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process archive');
    } finally {
      setIsLoading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleClearStore() {
    clearRinStore();
    setResult(null);
    setError('');
    setQuery('');
    setExcludeOrg('');
    setOnlyVerified(false);
    setSelectedFileName('');
    setStoreVersion((v) => v + 1);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const bucketCounts = matterRecords.reduce<Record<string, number>>((acc, record: RinRecord) => {
    const key = `${record.legal_bucket} / ${record.sub_bucket}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const readableCount = matterRecords.filter((r: any) => r.readability === 'readable').length;
  const warningCount = matterRecords.filter((r: any) => r.possible_warning_sign).length;

  return (
    <div className="space-y-6 rounded-xl border p-4">
      <div className="rounded border border-red-500 bg-red-50 p-2 text-sm font-bold text-red-700">
        RIN DEBUG LIVE
      </div>

      <div>
        <h2 className="text-xl font-semibold">Case File Optimizer</h2>
        <p className="text-sm opacity-80">
          Import, organize, and search your case materials in one place. Powered by RIN: Record Intake Normalizer.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleZip}
          className="max-w-full text-sm"
        />

        <button
          type="button"
          className="rounded border px-3 py-2 text-sm"
          onClick={handleClearStore}
        >
          Clear Store
        </button>

        <div className="text-sm text-slate-600">
          Selected: <span className="font-medium">{selectedFileName || 'none'}</span>
        </div>
      </div>

      {isLoading && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Processing archive through RIN...
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Metric label="Intakes" value={matterIntakes.length} />
        <Metric label="Records" value={matterRecords.length} />
        <Metric label="Identities" value={matterIdentities.length} />
        <Metric label="Readable" value={readableCount} />
        <Metric label="Warnings" value={warningCount} />
      </div>

      <div className="rounded border p-3 text-xs bg-slate-50">
        <div><strong>Debug current matterId:</strong> {matterId}</div>
        <div><strong>Store intakes total:</strong> {store.intakes.length}</div>
        <div><strong>Store records total:</strong> {store.records.length}</div>
        <div><strong>Store identities total:</strong> {store.identities.length}</div>
        <div><strong>Matter records:</strong> {matterRecords.length}</div>
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

          {searchResults.length === 0 && (
            <p className="text-sm opacity-70">No results found.</p>
          )}

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

        {Object.keys(bucketCounts).length === 0 ? (
          <p className="text-sm opacity-70">No RIN records processed for this matter yet.</p>
        ) : (
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
        )}
      </div>

      {result && (
        <details className="rounded border p-3" open>
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