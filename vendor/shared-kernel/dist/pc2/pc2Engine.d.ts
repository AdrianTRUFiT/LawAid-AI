import type { ClarityRecord, CodeIntent, PainRecord, PatternRecord, Pc2Input, Pc2Result } from "./pc2Contracts.js";
export declare function createPainRecord(input: Pc2Input): PainRecord;
export declare function createPatternRecord(pain: PainRecord, repeatedSignals?: string[]): PatternRecord;
export declare function createClarityRecord(pattern: PatternRecord, description: string): ClarityRecord;
export declare function createCodeIntent(clarity: ClarityRecord, targetModule: string, targetFiles?: string[]): CodeIntent;
export declare function processPc2(input: Pc2Input): Pc2Result;
