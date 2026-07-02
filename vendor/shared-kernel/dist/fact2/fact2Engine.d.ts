import type { AnalysisRecord, CorrectionRecord, Fact2Input, Fact2Result, FailureRecord, TestedRecord } from "./fact2Contracts.js";
export declare function createFailureRecord(input: Fact2Input): FailureRecord;
export declare function createAnalysisRecord(failure: FailureRecord): AnalysisRecord;
export declare function createCorrectionRecord(analysis: AnalysisRecord, changedFiles?: string[]): CorrectionRecord;
export declare function createTestedRecord(correction: CorrectionRecord, verificationMethod?: string[]): TestedRecord;
export declare function processFact2(input: Fact2Input): Fact2Result;
