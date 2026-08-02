# Relationships as Decompression

## Thesis

Artifacts do not carry singular, self-sufficient meaning. Meaning is partially recoverable from the pattern of relationships surrounding them.

A bit becomes useful through position and convention. A word becomes useful through syntax, speaker, history, and response. A receipt becomes useful through the authority and event lineage it closes. Project 0 therefore models relationships as load-bearing semantic material.

## Required Edge Envelope

A canonical relationship (edge) must strictly define its identity and scope. It records:

- `id`: cryptographic hash of the edge's core fields (type, from, to, assertedBy, basis, disclosure).
- `type`: one of the finite canonical edge types.
- `from`: ID of the origin node.
- `to`: ID of the target node.
- `assertedBy`: attributable actor identifier.
- `createdAt`: recorded time of assertion.
- `basis`: ID of the source, observation, rule, or declared judgment justifying the edge.
- `disclosure`: policy governing revelation and reuse (must not exceed the constraints of its target nodes).
- optional `validFrom`, `validUntil`, `supersedes`, and confidence metadata.

Confidence may rank a relationship. It may not replace its basis.

## Finite Canonical Edge Set and Direction Table

The canonical edge set is finite and strictly directed.

| Edge Type | From Kind | To Kind | Family |
|---|---|---|---|
| `derived_from` | `inference`, `harvest`, `claim` | `source`, `observation`, `inference`, `claim` | Derivation |
| `quotes` | `source`, `observation`, `claim` | `source`, `claim`, `proposal` | Derivation |
| `compresses` | `harvest` | `source`, `observation`, `claim`, `inference` | Derivation |
| `revises` | ANY (except `source`) | Same Kind | Derivation |
| `supports` | `inference`, `claim`, `observation` | `claim`, `proposal`, `inference` | Epistemic |
| `contradicts` | `rejection`, `claim`, `inference` | `claim`, `inference` | Epistemic |
| `qualifies` | `inference`, `claim` | `claim`, `proposal`, `inference` | Epistemic |
| `observes` | `witness` | ANY | Epistemic |
| `answers` | `claim`, `observation` | `tension`, `proposal` | Dialogic |
| `asks` | `proposal`, `tension` | ANY | Dialogic |
| `rebuttal_to` | `rejection` | `claim`, `proposal`, `inference` | Dialogic |
| `responds_to` | `rejection`, `claim` | `proposal`, `claim` | Dialogic |
| `continues` | `proposal`, `tension` | `proposal`, `tension` | Dialogic |
| `delegates` | `claim`, `source` | `claim` | Authority |
| `consumes` | `source`, `inference` | `claim`, `source` | Authority |
| `revokes` | `claim`, `source` | `claim` | Authority |
| `permits_disclosure`| `claim` | ANY | Authority |
| `precedes` | ANY | ANY | Temporal |
| `overlaps` | ANY | ANY | Temporal |
| `supersedes` | ANY (except `source`) | Same Kind | Temporal |

## Edge Laws

Relationships in Project 0 follow strict constraints to ensure executable continuity and prevent silent rewrites or invalid evaluations.

### Node-Specific Edge Constraints
- **`inference` node**: MUST have at least one outgoing `derived_from` edge to its sources or evidence. `compresses` CANNOT substitute for `derived_from`, as compression belongs strictly to the `harvest` node kind.
- **`rejection` node**: MUST target the specific node it rejects.
  - Dialogic rejection: Uses `responds_to` or `rebuttal_to` against a `proposal` or `claim`.
  - Epistemic rejection: The `contradicts` edge applies ONLY against a truth-apt assertion (i.e., a `claim` or `inference`).

### Edge Admissions and Timing
- **Strictly Atomic Admission**: Admission of a node and its mandatory lineage edges MUST be atomic. An `inference` node cannot be admitted without its required `derived_from` edges. Partial or fallback admission is invalid.

### Traversal and Integrity
- **Stable edge identity**: Edge identity is defined by its cryptographic `id`. It cannot change direction, endpoints, or type after admission.
- **Exact direction**: Edges strictly follow the `From Kind` → `To Kind` enforcement table. Reversing an edge yields a validation failure.
- **Cross-scope rules**: A relationship between two nodes with differing `disclosure` policies MUST inherit the strictest policy of the two nodes. An edge cannot expose a target node beyond its explicit boundary.
- **Acyclicity rule**: Any edge belonging to the `Derivation` or `Temporal` family MUST NOT create a cycle. Cycle detection is evaluated at admission time; cyclic admissions must be rejected.
- **Deterministic traversal**: When multiple valid paths exist, deterministic ordering relies strictly on cryptographic tie-breaking. Sort edges by the target node's `id`, then by the edge's `id`. `createdAt` MUST NOT be used for deterministic ordering due to clock drift and serialization disparities.

### Conflict and Evolution
- **Dispute and supersession**: An edge with `type: supersedes` targeting an older edge demotes the target edge from the active evaluation graph. A disputed edge (logged via a `Tension` node targeting the edge) remains in the graph but is marked as `disputed` and excluded from active evidence traversal.
- **Plural current harvests**: Multiple `harvest` nodes can `compress` the same sources. No engine may force singular canonical truth; all valid harvests remain in the traversal path.
- **Basis and authorship**: An edge's `assertedBy` dictates its authority. Edges without a demonstrable `basis` or valid authority signature are excluded from canonical evaluation.

## Local collapse, never final collapse

An application may produce a local interpretation for a particular purpose. That interpretation is a new attributable node. It does not become the artifact's final meaning.

Repeated observation may create new states and new relationships. The graph keeps those collapses inspectable rather than pretending they never happened.

## Compression requirement

A compressed representation is adequate only if its declared decoder can restore the relationships required for the intended use. Smaller bytes with severed lineage are loss, even when the prose survives.
