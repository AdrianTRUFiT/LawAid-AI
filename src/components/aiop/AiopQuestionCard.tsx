import React from "react";
import { AiopQuestion } from "../../lib/aiop";

interface Props {
  question: AiopQuestion;
  value?: string | string[];
  onChange: (value: string | string[]) => void;
}

export function AiopQuestionCard({ question, value, onChange }: Props) {
  return (
    <div className="rounded-xl border p-5">
      <div className="mb-2 text-lg font-semibold">{question.prompt}</div>
      {question.helperText ? (
        <div className="mb-4 text-sm opacity-75">{question.helperText}</div>
      ) : null}

      {question.type === "text" ? (
        <textarea
          className="min-h-[120px] w-full rounded-lg border p-3"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : null}

      {question.type === "single_select" && question.options ? (
        <div className="grid gap-2">
          {question.options.map((option) => {
            const checked = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`rounded-lg border px-3 py-3 text-left ${
                  checked ? "border-black font-semibold" : ""
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
