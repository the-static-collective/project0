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
- `basis`: (Nullable) ID of the receipt, source, rule, or judgment justifying the edge. Mandatory for cross-scope and Authority edges.
- `disclosure`: policy governing revelation and reuse.
- optional `validFrom`, `validUntil`, and confidence metadata.

Confidence may rank a relationship. It may not replace its basis.

## Finite Canonical Edge Set and Direction Tuples

The canonical edge set is the exhaustive `validTuples` array in `contract/edge-law.v0.1.json`. The family notation below is its human-readable compression. If a tuple is absent from the machine-readable array, admission fails; `KIND` and `ANY_NODE` never survive into the executable contract.

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
Validation requires these exact predicates to evaluate to `true` during admission or traversal. Every ID MUST be resolved via explicit lookup functions (`getNode`, `getEdge`, `getReceipt`) before reading fields.

1. **`isCrossScopeBridged(edge)`**:
   - `let fromObj = getNode(edge.from) || getEdge(edge.from);`
   - `let toObj = getNode(edge.to) || getEdge(edge.to);`
   - `if (!fromObj || !toObj) return false;`
   - `if (edge.scopeId == fromObj.scopeId && edge.scopeId == toObj.scopeId) return true;`
   - `if (!edge.basis) return false;`
   - `let receipt = getReceipt(edge.basis);`
   - `if (!receipt || receipt.receiptType != 'RevelationReceipt') return false;`
   - `let infoSourceScope = (edge.type == 'derived_from' || edge.type == 'quotes' || edge.type == 'compresses' || edge.type == 'depends_on') ? toObj.scopeId : fromObj.scopeId;`
   - `let infoDestScope = (infoSourceScope == toObj.scopeId) ? fromObj.scopeId : toObj.scopeId;`
   - `let lease = getReceipt(receipt.authorityRef);`
   - `if (!lease || lease.receiptType != 'LeaseGrant') return false;`
   - `let requestRef = receipt.outputs.requestRef;`
   - `if (!requestRef) return false;`
   - `let req = getRequest(requestRef);`
   - `if (!req) return false;`
   - `return (`
     - `edge.scopeId == infoDestScope &&`
     - `receipt.inputs.sourceScopeId == infoSourceScope &&`
     - `receipt.outputs.destinationScopeId == infoDestScope &&`
     - `receipt.outputs.requestRef == req.id &&`
     - `req.requester == edge.assertedBy &&`
     - `req.requester == receipt.issuer &&`
     - `req.destinationScopeId == infoDestScope &&`
     - `req.status == 'open' &&`
     - `isRequestValidAt(req, receipt.issuedAt) &&`
     - `edge.assertedBy == receipt.issuer &&`
     - `receipt.issuer == lease.outputs.recipient &&`
     - `lease.outputs.capability == 'cross_scope_read' &&`
     - `receipt.outputs.purpose == req.purpose &&`
     - `receipt.policyRefs.includes(edge.disclosure) &&`
     - `receipt.subject == edge.id &&`
     - `isValidLeaseGrant(receipt.authorityRef) &&`
     - `verifyLineage(receipt.previousReceiptRefs)`
   - `);`
   - *Result*: Cross-scope edges fail admission unless the revelation names one exact, independently declared Request and every identity, purpose, scope, authority, disclosure, validity, and lineage binding agrees.

2. **`isValidAuthorityEdge(edge)`**:
   - `const authorityTypes = ['delegates', 'consumes', 'revokes', 'permits_disclosure'];`
   - `if (!authorityTypes.includes(edge.type)) return true;`
   - `if (!edge.basis) return false;`
   - `let receipt = getReceipt(edge.basis);`
   - `if (!receipt) return false;`
   - `if (receipt.receiptType == 'WitnessReceipt' || receipt.receiptType == 'LeaseConsumption') return false; // Grant no authority`
   - `if (receipt.receiptType != 'LeaseGrant') return false;`
   - `return (`
     - `receipt.outputs.capability == edge.type &&`
     - `receipt.outputs.recipient == edge.assertedBy &&`
     - `receipt.issuer != null &&`
     - `receipt.outputs.scopeId == edge.scopeId &&`
     - `receipt.outputs.logicalExpiry > Date.now() &&`
     - `receipt.outputs.invocationsRemaining > 0 &&`
     - `receipt.policyRefs.includes(edge.disclosure) &&`
     - `isValidLeaseGrant(receipt.receiptId)`
   - `);`
   - *Result*: Semantic attribution does not act as authorization. Operation-specific authority validation must occur against a valid `LeaseGrant`, binding capability, recipient, actor, scope, expiry, invocation availability, disclosure, and the requested operation. `LeaseConsumption` records consumption and never independently grants authority; `WitnessReceipt` grants no authority.

3. **`isDisputed(edge)`**:
   - `return graph.exists(e => {`
   - `  let fromNode = getNode(e.from);`
   - `  return e.type == 'answers' && fromNode && fromNode.kind == 'tension' && e.to == edge.id;`
   - `});`

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
- **Durable order**: Accepted-event sequence is the only replay order. `createdAt` records asserted wall-clock time and never determines durable order.
- **Deterministic traversal**: Build adjacency from one accepted snapshot; sort candidate steps by edge type, edge ID, traversal direction, then destination object ID; traverse breadth-first over `(objectId, polarity)`; retain the shortest path per `(terminalSourceId, polarity)`; break equal-length ties by edge-ID sequence and then object-ID sequence; finally sort returned paths by terminal source ID, polarity, edge-ID sequence, then object-ID sequence. No cryptographic property is assumed for IDs until Issue #5 is closed.
- **TranchNode adapter ordering**: After mapping to TranchNode v0.1, use its exact edge-kind, edge-ID, direction, destination-node-ID order and node-only breadth-first/path tie-break rules. Project 0-only edge types and edge endpoints are classified before traversal; they are never silently inserted into TranchNode ordering.

### Conflict and Evolution
- **Dispute and supersession**: An edge with `type: supersedes` targeting an older edge demotes the target edge from the active evaluation graph. A disputed edge (evaluated via `isDisputed(edge)`) remains in the graph but is excluded from active evidence traversal.
- **Plural current harvests**: Multiple `harvest` nodes can `compress` the same sources. No engine may force singular canonical truth; all valid harvests remain in the traversal path.

### Evidence Traversal Classification
The machine-readable copy is `contract/edge-law.v0.1.json`. A disputed or superseded edge is never traversed as active evidence.

| Edge type | Entry direction | Polarity | Role | Disputed/superseded behavior |
|---|---|---|---|---|
| `derived_from` | outgoing | preserve | evidence | inactive |
| `quotes` | none | none | context/lineage | retained as context; superseded form is historical |
| `compresses` | none | none | harvest membership | retained for plurality; superseded form is historical |
| `revises` | none | none | history/currentness | prior remains visible |
| `depends_on` | outgoing | preserve | dependency | excluded from active closure |
| `supports` | incoming | preserve | evidence | excluded |
| `contradicts` | either | toggle | evidence | excluded |
| `qualifies` | incoming | preserve | evidence | excluded |
| `observes` | incoming | preserve | witness evidence | excluded; attestation never becomes proof of its subject |
| `answers` | none | none | context/dispute operation | `answers(tension, edge)` disputes its target; target remains visible |
| `asks` | none | none | context | never evidence by itself |
| `rebuttal_to` | none | none | attributable dissent | never negative evidence by itself |
| `responds_to` | none | none | context | never evidence by itself |
| `continues` | none | none | context | never evidence by itself |
| `delegates` | none | none | authority | ineffective when disputed, superseded, expired, revoked, or exhausted |
| `consumes` | none | none | authority | records use and never grants capacity |
| `revokes` | none | none | authority | affects authority only |
| `permits_disclosure` | none | none | authority/disclosure | affects disclosure only |
| `precedes` | none | none | temporal | never determines durable event order |
| `overlaps` | none | none | temporal | temporal context only |
| `supersedes` | none | none | currentness | target remains historical; inactive if the superseding assertion is disputed or superseded |

## Local collapse, never final collapse

An application may produce a local interpretation for a particular purpose. That interpretation is a new attributable node. It does not become the artifact's final meaning.

Repeated observation may create new states and new relationships. The graph keeps those collapses inspectable rather than pretending they never happened.

## Compression requirement

A compressed representation is adequate only if its declared decoder can restore the relationships required for the intended use. Smaller bytes with severed lineage are loss, even when the prose survives.
