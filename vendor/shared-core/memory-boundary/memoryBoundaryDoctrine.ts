import type { BoundaryLayerDefinition, BoundaryGap, FinancialMemoryCrossingRule } from "./memoryBoundaryContracts";

export const MEMORY_BOUNDARY_LAYER_DEFINITIONS: BoundaryLayerDefinition[] = [
  {
    key: "THINKBASE_AI",
    displayName: "ThinkBaseAI",
    role: "Processing / retrieval / interpretation substrate",
    does: [
      "Interprets",
      "Retrieves",
      "Translates",
      "Supports non-executing semantic compilation"
    ],
    mustNotDo: [
      "Own truth",
      "Precede identity",
      "Precede refusal",
      "Become custody",
      "Become payment authority"
    ],
    oneLineLock: "ThinkBaseAI = processing and retrieval substrate. It interprets. It does not own.",
    canonicalStatus: "VERIFIED"
  },
  {
    key: "SOULBASE_AI",
    displayName: "SoulBaseAI?",
    role: "Personal continuity / private memory substrate",
    does: [
      "Persists authorized memory projections user-side",
      "Carries permitted continuity",
      "Stores bounded derived memory only when authorized"
    ],
    mustNotDo: [
      "Become financial truth",
      "Become payment authority",
      "Override FundTrackerAI",
      "Own raw bank data by default",
      "Replace SoulVault? custody",
      "Override user authorization"
    ],
    oneLineLock: "SoulBaseAI? = personal continuity and private memory substrate. It persists. It does not govern.",
    canonicalStatus: "PRE_CANONICAL"
  },
  {
    key: "SOULVAULT",
    displayName: "SoulVault?",
    role: "Custody plane / private source-data container",
    does: [
      "Contains private source data",
      "Preserves records",
      "Preserves session artifacts",
      "Holds source material under custody control"
    ],
    mustNotDo: [
      "Be confused with memory doctrine",
      "Be confused with processing substrate",
      "Become payment authority",
      "Become transaction truth"
    ],
    oneLineLock: "SoulVault? = custody plane and private source-data container. It is where things are preserved, not where things are processed.",
    canonicalStatus: "VERIFIED"
  },
  {
    key: "SOULMEMORY",
    displayName: "SoulMemory?",
    role: "Memory doctrine / continuity governance law",
    does: [
      "Governs what may persist",
      "Governs how memory is bounded",
      "Defines continuity law"
    ],
    mustNotDo: [
      "Be treated as a runtime store",
      "Be treated as an execution layer",
      "Replace SoulVault? custody",
      "Replace SoulBaseAI? substrate"
    ],
    oneLineLock: "SoulMemory? = memory doctrine and continuity law. It governs what persists and how. It is not a folder; it is a rule set.",
    canonicalStatus: "VERIFIED"
  },
  {
    key: "SOULMARK",
    displayName: "SoulMark?",
    role: "Authorship verification / provenance signal",
    does: [
      "Marks origin",
      "Verifies authorship",
      "Provides provenance signal",
      "Anchors anti-drift lineage"
    ],
    mustNotDo: [
      "Become a storage layer",
      "Become custody authority",
      "Become payment authority",
      "Become memory substrate"
    ],
    oneLineLock: "SoulMark? = authorship verification and provenance signal. It marks. It does not store.",
    canonicalStatus: "VERIFIED"
  }
];

export const FINANCIAL_MEMORY_CROSSING_RULE: FinancialMemoryCrossingRule = {
  mayPersistAsFinancialMemory: [
    "ledger-safe summary",
    "continuity-safe financial pattern",
    "authorized user-scope reference",
    "retention-bounded memory artifact",
    "explicitly permitted memory projection emitted by FundTrackerAI"
  ],
  mustRemainPrivateSourceData: [
    "bank statements",
    "raw processor objects",
    "full account numbers",
    "unredacted payment methods",
    "private source documents",
    "legal evidence files",
    "unrestricted financial history"
  ],
  allowedDerivedSummary:
    "A ledger-safe summary is the canonical derived form: processed, redacted, retention-bounded, and governed by FundTrackerAI as a representation of financial truth, not the truth itself.",
  requiresAuthorization: [
    "custody class assignment",
    "redaction level confirmation",
    "retention rule assignment",
    "user/container scope confirmation",
    "downstream consumer permission"
  ],
  cannotCrossByDefault: [
    "raw processor objects",
    "raw bank statements",
    "full account numbers",
    "unrestricted financial history",
    "unredacted payment methods",
    "private source documents",
    "legal evidence files",
    "external processor authority treated as truth"
  ]
};

export const MEMORY_BOUNDARY_GAPS: BoundaryGap[] = [
  {
    id: "GAP_1",
    title: "SoulBaseAI? has no standalone sealed authority document",
    description:
      "SoulBaseAI? is coherent from manifest and audit evidence, but it has not passed Plan B? as a named sealed build authority.",
    blocksStage2: true
  },
  {
    id: "GAP_2",
    title: "Custody class taxonomy is not yet formally schematized",
    description:
      "The Stage 2 FundTrackerAI emit contract requires custodyClass, but the taxonomy is not yet formally defined as a schema.",
    blocksStage2: true
  },
  {
    id: "GAP_3",
    title: "SoulVault? / SoulBaseAI? boundary has no enforcement artifact",
    description:
      "The distinction between custody and memory is verified here but still requires a shared-core enforcement artifact.",
    blocksStage2: true
  },
  {
    id: "GAP_4",
    title: "SoulMemory? governance of SoulBaseAI? is not formally specified",
    description:
      "SoulMemory? should govern what SoulBaseAI? may hold, but the governance contract does not yet exist.",
    blocksStage2: true
  }
];

export const MEMORY_BOUNDARY_MUST_CONFIRM = [
  "ThinkBaseAI = processing / retrieval / interpretation substrate",
  "SoulBaseAI? = personal continuity / private memory substrate",
  "SoulVault? = custody plane / private source-data container",
  "SoulMemory? = memory doctrine / continuity governance law",
  "SoulMark? = authorship verification / provenance signal"
];

export const MEMORY_BOUNDARY_MUST_REFUSE = [
  "SoulBaseAI? must not become transaction truth",
  "SoulBaseAI? must not become payment authority",
  "SoulBaseAI? must not own raw bank data by default",
  "SoulBaseAI? must not replace SoulVault? custody",
  "SoulBaseAI? must not override FundTrackerAI",
  "SoulBaseAI? must not override user authorization"
];

export const MEMORY_BOUNDARY_GOVERNING_LAW =
  "Default crossing posture is DENY. Only explicitly permitted projections may cross from FundTrackerAI into SoulBaseAI?.";







