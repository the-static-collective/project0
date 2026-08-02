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

## Finite Canonical Edge Set and Direction Tuples

The canonical edge set is defined by strictly allowed `(Edge Type, From Kind, To Kind)` tuples. If a tuple is not explicitly listed, admission fails.

### Derivation Family
- `(derived_from, inference, source)` | `(derived_from, inference, observation)` | `(derived_from, inference, inference)` | `(derived_from, inference, claim)` | `(derived_from, inference, rejection)`
- `(derived_from, harvest, source)` | `(derived_from, harvest, observation)` | `(derived_from, harvest, inference)` | `(derived_from, harvest, claim)` | `(derived_from, harvest, rejection)`
- `(derived_from, claim, source)` | `(derived_from, claim, inference)` | `(derived_from, claim, claim)` | `(derived_from, claim, rejection)` *(Note: `claim` → `observation` is excluded; an inference must intervene).*
- `(quotes, source, source)` | `(quotes, observation, source)` | `(quotes, claim, source)` | `(quotes, claim, claim)` | `(quotes, claim, proposal)`
- `(compresses, harvest, source)` | `(compresses, harvest, observation)` | `(compresses, harvest, claim)` | `(compresses, harvest, inference)`
- `(revises, KIND, KIND)` *(where KIND is any node kind except `source`)*
- `(depends_on, inference, claim)` | `(depends_on, inference, inference)` | `(depends_on, inference, source)` | `(depends_on, proposal, claim)` | `(depends_on, proposal, source)` | `(depends_on, claim, claim)` | `(depends_on, claim, source)`

### Epistemic Family
- `(supports, inference, claim)` | `(supports, inference, proposal)` | `(supports, inference, inference)` | `(supports, claim, claim)` | `(supports, claim, proposal)` | `(supports, claim, inference)` | `(supports, observation, claim)` | `(supports, observation, proposal)`
- `(contradicts, rejection, claim)` | `(contradicts, rejection, inference)` | `(contradicts, claim, claim)` | `(contradicts, claim, inference)` | `(contradicts, inference, claim)` | `(contradicts, inference, inference)`
- `(qualifies, inference, claim)` | `(qualifies, inference, proposal)` | `(qualifies, inference, inference)` | `(qualifies, claim, claim)` | `(qualifies, claim, proposal)` | `(qualifies, claim, inference)`
- `(observes, witness, ANY_NODE)`

### Dialogic Family
- `(answers, claim, tension)` | `(answers, observation, tension)` | `(answers, tension, tension)` | `(answers, claim, proposal)` | `(answers, observation, proposal)` | `(answers, tension, edge)`
- `(asks, proposal, ANY_NODE)` | `(asks, tension, ANY_NODE)`
- `(rebuttal_to, rejection, claim)` | `(rebuttal_to, rejection, proposal)` | `(rebuttal_to, rejection, inference)`
- `(responds_to, rejection, proposal)` | `(responds_to, rejection, claim)` | `(responds_to, claim, proposal)` | `(responds_to, claim, claim)`
- `(continues, proposal, proposal)` | `(continues, tension, tension)`

### Authority Family
- `(delegates, claim, claim)` | `(delegates, source, claim)`
- `(consumes, source, claim)` | `(consumes, source, source)` | `(consumes, inference, claim)` | `(consumes, inference, source)`
- `(revokes, claim, claim)` | `(revokes, source, claim)`
- `(permits_disclosure, claim, ANY_NODE)`

### Temporal Family
- `(precedes, ANY_NODE, ANY_NODE)`
- `(overlaps, ANY_NODE, ANY_NODE)`
- `(supersedes, KIND, KIND)` *(except `source`)* | `(supersedes, edge, edge)`

## Edge Laws

Relationships in Project 0 follow strict constraints to ensure executable continuity and prevent silent rewrites or invalid evaluations.

### Executable Predicates
Validation requires these exact predicates to evaluate to `true` during admission or traversal:

1. **`isCrossScopeBridged(edge)`**:
   - `if (edge.from.scopeId == edge.to.scopeId) return true;`
   - `else return isValidReceipt(edge.basis) && (edge.basis.type == 'permits_disclosure' || edge.basis.type == 'RevelationReceipt');`
   - *Result*: Cross-scope edges fail admission unless explicitly bridged.
2. **`isValidAuthorityEdge(edge)`**:
   - `if (edge.family != 'Authority') return true;`
   - `else return isValidReceipt(edge.basis) && (edge.basis.type == 'LeaseGrant' || edge.basis.type == 'LeaseConsumption' || edge.basis.type == 'WitnessReceipt');`
   - *Result*: Semantic attribution does not act as authorization.
3. **`isDisputed(edge)`**:
   - `return graph.exists(e => e.type == 'answers' && e.from.kind == 'tension' && e.to == edge.id);`

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
- **Acyclicity rule**: Any edge belonging to the `Derivation` family, as well as `precedes` and `supersedes` in the `Temporal` family, MUST NOT create a cycle. Cycle detection is evaluated at admission time. (The `overlaps` edge may be cyclic/symmetric).
- **Deterministic traversal**: When multiple valid paths exist, deterministic ordering relies strictly on cryptographic tie-breaking. Sort edges by the target node/edge `id`, then by the edge's `id`. `createdAt` MUST NOT be used for deterministic ordering.

### Conflict and Evolution
- **Dispute and supersession**: An edge with `type: supersedes` targeting an older edge demotes the target edge from the active evaluation graph. A disputed edge (evaluated via `isDisputed(edge)`) remains in the graph but is excluded from active evidence traversal.
- **Plural current harvests**: Multiple `harvest` nodes can `compress` the same sources. No engine may force singular canonical truth; all valid harvests remain in the traversal path.

### Evidence Traversal Polarity
When traversing the graph to compile evidence, an edge strictly applies the following polarity to its origin node (`from`) in relation to the target node (`to`):
- **Amplify**: `supports`, `observes`, `answers`, `revises`, `compresses`, `quotes`, `derived_from`, `depends_on`.
- **Mitigate**: `contradicts`, `rebuttal_to`, `responds_to`.
- **Replace/Exclude**: `supersedes`, `revokes`, `consumes`, or any edge where `isDisputed(edge) == true`.
- **Contextual**: `asks`, `continues`, `precedes`, `overlaps`, `delegates`, `permits_disclosure` (meaning depends entirely on target evaluation).

## Local collapse, never final collapse

An application may produce a local interpretation for a particular purpose. That interpretation is a new attributable node. It does not become the artifact's final meaning.

Repeated observation may create new states and new relationships. The graph keeps those collapses inspectable rather than pretending they never happened.

## Compression requirement

A compressed representation is adequate only if its declared decoder can restore the relationships required for the intended use. Smaller bytes with severed lineage are loss, even when the prose survives.
