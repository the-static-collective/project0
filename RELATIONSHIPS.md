# Relationships as Decompression

## Thesis

Artifacts do not carry singular, self-sufficient meaning. Meaning is partially recoverable from the pattern of relationships surrounding them.

A bit becomes useful through position and convention. A word becomes useful through syntax, speaker, history, and response. A receipt becomes useful through the authority and event lineage it closes. Project 0 therefore models relationships as load-bearing semantic material.

## Required Edge Envelope

A canonical relationship (edge) must strictly define its identity and scope. It records:

- `id`: stable identifier (cryptographic hash specification deferred to Issue #5).
- `type`: one of the finite canonical edge types.
- `from`: ID of the origin node or edge.
- `to`: ID of the target node or edge.
- `assertedBy`: attributable actor identifier (attribution only; this does not inherently grant authority).
- `createdAt`: recorded time of assertion.
- `scopeId`: the execution or context boundary the edge belongs to.
- `basis`: ID of the source, observation, rule, or declared judgment justifying the edge.
- `disclosure`: policy governing revelation and reuse.
- optional `validFrom`, `validUntil`, and confidence metadata.

Confidence may rank a relationship. It may not replace its basis.

## Finite Canonical Edge Set and Direction Table

The canonical edge set is finite and strictly directed. The `To Kind` can be a node kind or an `edge`.

| Edge Type | From Kind | To Kind | Family |
|---|---|---|---|
| `derived_from` | `inference`, `harvest`, `claim` | `source`, `observation`, `inference`, `claim`, `rejection` | Derivation |
| `quotes` | `source`, `observation`, `claim` | `source`, `claim`, `proposal` | Derivation |
| `compresses` | `harvest` | `source`, `observation`, `claim`, `inference` | Derivation |
| `revises` | ANY (except `source`) | Same Kind | Derivation |
| `depends_on` | `inference`, `proposal`, `claim` | `claim`, `inference`, `source` | Derivation |
| `supports` | `inference`, `claim`, `observation` | `claim`, `proposal`, `inference` | Epistemic |
| `contradicts` | `rejection`, `claim`, `inference` | `claim`, `inference` | Epistemic |
| `qualifies` | `inference`, `claim` | `claim`, `proposal`, `inference` | Epistemic |
| `observes` | `witness` | ANY | Epistemic |
| `answers` | `claim`, `observation`, `tension` | `tension`, `proposal`, `edge` | Dialogic |
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
| `supersedes` | ANY (except `source`), `edge` | Same Kind, `edge` | Temporal |

*Note: A direct `derived_from` edge from a `claim` to an `observation` is explicitly excluded to enforce the boundary (an `inference` must intervene).*

## Edge Laws

Relationships in Project 0 follow strict constraints to ensure executable continuity and prevent silent rewrites or invalid evaluations.

### Node-Specific Edge Constraints
- **`inference` node**: MUST have at least one outgoing `derived_from` edge to its sources or evidence. `compresses` CANNOT substitute for `derived_from`, as compression belongs strictly to the `harvest` node kind.
- **`rejection` node**: MUST target the specific node it rejects.
  - Dialogic rejection: Uses `responds_to` or `rebuttal_to` against a `proposal` or `claim`.
  - Epistemic rejection: The `contradicts` edge applies ONLY against a truth-apt assertion (i.e., a `claim` or `inference`).

### Edge Admissions and Timing
- **Sequential Event Admission**: Admission follows TranchNode v0.1's sequential accepted-event model. Nodes and edges are admitted separately.
- **Pending Lineage**: A node requiring mandatory lineage (e.g., an `inference` requiring `derived_from`) is inactive and non-evaluable in the semantic graph until its required edges are successfully admitted.

### Traversal and Integrity
- **Stable edge identity**: Edge identity is defined by its `id`. It cannot change direction, endpoints, or type after admission.
- **Exact direction**: Edges strictly follow the `From Kind` → `To Kind` enforcement table. Reversing an edge yields a validation failure.
- **Cross-scope rules**: A relationship between two contexts evaluates `scopeId`. An edge crossing scopes is rejected at admission unless its `basis` references a valid `permits_disclosure` edge or `RevelationReceipt` explicitly bridging the two scopes.
- **Acyclicity rule**: Any edge belonging to the `Derivation` family, as well as `precedes` and `supersedes` in the `Temporal` family, MUST NOT create a cycle. Cycle detection is evaluated at admission time. (The `overlaps` edge may be cyclic/symmetric).
- **Deterministic traversal**: When multiple valid paths exist, deterministic ordering relies strictly on cryptographic tie-breaking. Sort edges by the target node/edge `id`, then by the edge's `id`. `createdAt` MUST NOT be used for deterministic ordering.
- **Polarity and Evidence**: Traversal rules explicitly dictate evidence polarity: `supports` and `answers` amplify the target, `contradicts` and `rebuttal_to` mitigate it, and edges marked as `disputed` (e.g., via a tension node) entirely exclude their target from active evidence traversal.

### Conflict and Evolution
- **Dispute and supersession**: An edge with `type: supersedes` targeting an older edge demotes the target edge from the active evaluation graph. A disputed edge (e.g., via a `tension` node that `answers` the edge) remains in the graph but is marked as `disputed` and excluded from active evidence traversal.
- **Plural current harvests**: Multiple `harvest` nodes can `compress` the same sources. No engine may force singular canonical truth; all valid harvests remain in the traversal path.
- **Basis and authority**: An edge's `assertedBy` provides attribution. Authority is evaluated by bounded lease paths, not merely by attribution. Conflating attribution with authorization violates bounded authority. Any edge in the `Authority` family (`delegates`, `consumes`, `revokes`, `permits_disclosure`) MUST have its `basis` point to a valid `LeaseGrant` or `Receipt`. An authority edge without a cryptographic receipt basis is rejected at admission.

## Local collapse, never final collapse

An application may produce a local interpretation for a particular purpose. That interpretation is a new attributable node. It does not become the artifact's final meaning.

Repeated observation may create new states and new relationships. The graph keeps those collapses inspectable rather than pretending they never happened.

## Compression requirement

A compressed representation is adequate only if its declared decoder can restore the relationships required for the intended use. Smaller bytes with severed lineage are loss, even when the prose survives.
