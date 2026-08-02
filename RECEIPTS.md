# Receipts

Receipts are immutable, attributable records of system-significant events. They make actions inspectable without pretending inspection guarantees truth.

## Minimal receipt envelope

- `receiptId`
- `receiptType`
- `issuedAt`
- `issuer`
- `subject`
- `inputs`
- `outputs`
- `authorityRef`, when authority is required
- `policyRefs`
- `previousReceiptRefs`
- `canonicalHash`

## Initial receipt families

| Receipt | Records |
|---|---|
| `RevelationReceipt` | Material revealed under a stated purpose and disclosure policy |
| `TriageReceipt` | A disposition decision and its grounds |
| `LeaseGrant` | Bounded authority delegated under prior authority |
| `LeaseConsumption` | One invocation or unit of granted authority consumed |
| `TransferReceipt` | Grants transferred into a discriminator or execution boundary |
| `DispositionReceipt` | The resulting epistemic disposition |
| `WitnessReceipt` | An attributable report of observation |
| `PipelineAdmission` | Whether material may enter a declared pipeline |

## Authority lease

A lease grant identifies:

- capability
- scope
- recipient
- invocation limit
- logical or wall-clock expiry
- issuing authority
- disclosure constraints

Validity requires all constraints to pass. Partial validity is invalid for the requested act.

A transfer receipt references grant hashes. It does not retroactively authorize its own grants. Every successful invocation emits a lease-consumption receipt.

## Orthogonal decisions

Epistemic disposition and pipeline admission are separate:

- material may be interesting but inadmissible due to provenance or disclosure
- material may be admissible but weak, disputed, or irrelevant
- denial of all necessary authority makes execution inadmissible

## Graph requirement

Receipts form an append-only, queryable lineage. Every consequential output must be traceable to inputs, applicable authority, policies, and prior receipts.

## Non-claims

A receipt does not inherently prove:

- that its subject existed outside the reporting system
- that an interpretation was correct
- that an action was moral or lawful
- that a witness was accurate
- that a hash performed semantic validation

It proves a narrower and useful thing: the system preserved an attributable claim that a scoped event occurred within a recorded lineage.
