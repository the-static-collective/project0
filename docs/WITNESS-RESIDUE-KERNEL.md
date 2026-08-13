# Witness residue kernel v1

This slice mines the executable and historical donor work from PRs #19 and #21 onto `main` at dependency commit `754f48b`, after canonical-addressing PRs #23, #24, #28, and #31.

The hashable residue body is `project0.witness-residue.v1`: integer `sequence`, optional `previousResidueRef`, `observedAtRef`, optional `effectiveAtRef`, closed `residueType`, and `payloadRef`. `residueRef` is excluded from its own preimage. Derived proof receipts use `project0.derived-proof-receipt.v1` and cite `derivedFromBaseReceiptRef`.

All structured addresses call the shared `src/canonical-addressing` validator and RFC 8785/JCS implementation. Raw transport bytes use byte hashing and are never confused with semantic artifact addresses.

## Fixtures and boundaries

The executable fixtures cover durable refusal, malformed input, expected-head races, replay identity and corruption, causal cuts, four attachment-refusal predicates, proof rejection, derived receipt identity, absence of a self-verification method, and replay-derived use history.

Rejected alternatives: rebasing the stale stack unchanged; retaining its local canonicalizer; using timestamps as log order; allowing caller-supplied history; and allowing the Witness Plane to originate checker conclusions.

Unresolved tensions: the reference store is in-memory; signature checking is represented by an independently supplied reference; revocation-effective-time policy remains deliberately narrower than a distributed historical authority service.

CI, replay, hashing, and verification preserve attributable records. They do not manufacture truth, completeness, moral legitimacy, or authority.
