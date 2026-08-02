# Relationships as Decompression

## Thesis

Artifacts do not carry singular, self-sufficient meaning. Meaning is partially recoverable from the pattern of relationships surrounding them.

A bit becomes useful through position and convention. A word becomes useful through syntax, speaker, history, and response. A receipt becomes useful through the authority and event lineage it closes. Project 0 therefore models relationships as load-bearing semantic material.

## Typed relationship

A canonical relationship records:

- `type`
- `from`
- `to`
- `assertedBy`
- `createdAt`
- `basis` — source, observation, rule, or declared judgment
- `disclosure`
- optional `validFrom`, `validUntil`, `supersedes`, and confidence metadata

Confidence may rank a relationship. It may not replace its basis.

## Core relationship types

| Family | Examples |
|---|---|
| Derivation | `derived_from`, `quotes`, `compresses`, `revises` |
| Epistemic | `supports`, `contradicts`, `qualifies`, `observes` |
| Dialogic | `answers`, `asks`, `rebuttal_to`, `responds_to`, `continues` |
| Authority | `delegates`, `consumes`, `revokes`, `permits_disclosure` |
| Temporal | `precedes`, `overlaps`, `supersedes` |
| Product | downstream namespaced relationships |

## Edge Laws

Relationships in Project 0 follow strict constraints to ensure continuity and prevent silent rewrites or invalid evaluations.

### Node-Specific Edge Constraints
- **`inference` node**: MUST have at least one outgoing `derived_from` edge to its sources or evidence. `compresses` CANNOT substitute for `derived_from`, as compression belongs strictly to the `harvest` node kind.
- **`rejection` node**: MUST target the specific node it rejects.
  - Dialogic rejection: Uses `responds_to` or `rebuttal_to`.
  - Epistemic rejection: The `contradicts` edge applies ONLY when the rejection's grounds actually oppose a truth-apt assertion.

### Edge Admissions and Timing
- **Atomic admission**: Admission of a node and its mandatory edges MUST be atomic. If admitted separately, an `inference` node missing its `derived_from` edge is temporarily non-conforming and non-evaluable until its lineage closes.

### Traversal and Integrity
- **Stable edge identity**: A relationship must maintain a stable identity and cannot change direction or type after admission.
- **Exact direction**: Core relationships are directed edges. Traversal must respect the defined `from` and `to` nodes.
- **Same-scope and cross-scope**: Rules governing scope transitions (e.g., cross-scope rejection) must retain explicit lineage and preserve boundaries between contexts.
- **Acyclic families**: Certain families (like Derivation and Temporal) MUST remain acyclic to prevent paradoxes in lineage and traversal. Cycle checks are mandatory before admission.
- **Deterministic traversal**: When multiple valid paths exist, traversal must define explicit, deterministic tie-breaking (e.g., ordering by `createdAt` then `id`).

### Conflict and Evolution
- **Dispute and supersession**: A newer relationship can `supersede` an older one, or an edge can be disputed. Disputed edges must be excluded from active evidence while preserving their presence in the graph.
- **Plural current harvests**: Multiple valid, competing `harvest` nodes can exist concurrently over the same sources. No single harvest is forced as the singular canonical truth.
- **Basis, authorship, and disclosure**: Relationships inherit their standing from their explicitly recorded `basis` and `assertedBy` properties. The relationship cannot exceed the `disclosure` constraints of its target nodes, and it must respect creation order (`createdAt`).

## Local collapse, never final collapse

An application may produce a local interpretation for a particular purpose. That interpretation is a new attributable node. It does not become the artifact's final meaning.

Repeated observation may create new states and new relationships. The graph keeps those collapses inspectable rather than pretending they never happened.

## Compression requirement

A compressed representation is adequate only if its declared decoder can restore the relationships required for the intended use. Smaller bytes with severed lineage are loss, even when the prose survives.
