export function verifyTestedRecord(tested) {
    return (tested.verificationMethod.length > 0 &&
        (tested.result === "passed" ||
            tested.result === "failed" ||
            tested.result === "partial"));
}
//# sourceMappingURL=fact2Verifier.js.map