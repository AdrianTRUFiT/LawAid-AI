import React, { useMemo, useState } from "react";
import type {
  CapturedSignal,
  DiceSessionRecord,
  DiceSource,
  DiceThreadType,
} from "../../lib/dice";
import { createDiceInput, isDiceInputReady } from "../../lib/dice/diceContracts";
import { runDicePrimer } from "../../lib/dice/diceStore";

type Props = {
  onCapturedSignal?: (signal: CapturedSignal) => void;
  onSessionCreated?: (session: DiceSessionRecord) => void;
};

export default function AskLawAidPanel({
  onCapturedSignal,
  onSessionCreated,
}: Props) {
  const [source, setSource] = useState<DiceSource>("reddit");
  const [threadType, setThreadType] = useState<DiceThreadType>("copied_prompt");
  const [subreddit, setSubreddit] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [session, setSession] = useState<DiceSessionRecord | null>(null);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => prompt.trim().length >= 6, [prompt]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const input = createDiceInput(prompt, source, {
      subreddit: subreddit || undefined,
      postTitle: postTitle || undefined,
      threadType,
    });

    if (!isDiceInputReady(input)) {
      setError("Please enter a more complete question so Ask LawAidAI can classify it properly.");
      return;
    }

    const nextSession = runDicePrimer(input);
    setSession(nextSession);
    onSessionCreated?.(nextSession);

    if (nextSession.capturedSignal) {
      onCapturedSignal?.(nextSession.capturedSignal);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-legal-navy">Ask LawAidAI</h2>
        <p className="mt-1 text-sm text-slate-600">
          Bring a real issue. The system will classify it, return useful guidance,
          and tell you whether deeper continuation is worthwhile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Source">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as DiceSource)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="reddit">Reddit</option>
              <option value="qr">QR</option>
              <option value="landing_page">Landing Page</option>
              <option value="referral">Referral</option>
            </select>
          </Field>

          <Field label="Thread type">
            <select
              value={threadType}
              onChange={(e) => setThreadType(e.target.value as DiceThreadType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="copied_prompt">Copied Prompt</option>
              <option value="post">Post</option>
              <option value="comment">Comment</option>
            </select>
          </Field>

          <Field label="Subreddit / context">
            <input
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="ex: FamilyLaw"
            />
          </Field>
        </div>

        <Field label="Post title or topic">
          <input
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Optional source title"
          />
        </Field>

        <Field label="Question or issue">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={7}
            className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
            placeholder="Paste or write the real issue here..."
          />
        </Field>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-legal-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          Run Ask LawAidAI
        </button>
      </form>

      {session && (
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Problem Framing
            </div>
            <div className="mt-1 text-sm text-slate-700">
              {session.response.problemFraming}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Direct Guidance
            </div>
            <ul className="mt-2 space-y-2 text-sm text-slate-700">
              {session.response.directGuidance.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>

          {session.response.watchOut && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Watch-Out
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {session.response.watchOut}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Recommended Next Step
            </div>
            <div className="mt-1 text-sm font-medium text-legal-navy">
              {session.response.continuationSuggestion}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      {children}
    </label>
  );
}