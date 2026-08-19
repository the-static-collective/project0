# Typed Continuity Braid v0

Typed Continuity Braid v0 is Project 0's bounded portable grammar for making evidence-backed continuity claims across change without collapsing different kinds of continuity into one story.

It is an experimental Project 0 seam. It is not a global continuity service, registry, identity provider, authority system, historical truth engine, event bus, or downstream adoption mandate.

## Core law

> **Continuity is typed, braided, purpose-relative, and non-transitive by default.**

A continuity claim answers:

> Same what, across which change, by what bridge, witnessed how, and what specifically did not cross?

A claim is a relationship across change, not a declaration that two states are simply the same thing. Material ancestry must close against independently supplied context. Breakage, loss, residuals, uncertainty, and reconstitution remain visible. Reconstruction never becomes historical occurrence merely because it is useful or faithful.

The v0 protocol is `p0.continuity/0.1`. Deterministic claims use the local addressing domain `Project0-Continuity-v0.1|` and produce `cty-<sha256>` references through Project 0's existing canonicalization machinery.

## Portable lanes

Project 0 defines eight coarse anti-impersonation boundaries. Downstream dimensions inside a lane remain domain-owned.

| Lane | Portable question |
| --- | --- |
| `identity` | What identified subject, artifact family, office, project, or constituted entity is claimed to remain the same? |
| `authority` | What power, warrant, capability, stewardship right, office, or execution permission is claimed to continue? |
| `custody` | What artifact, property, corpus, key material, archive, responsibility, or protected resource moved into whose care? |
| `participants` | Which people, roles, maintainers, communities, institutions, or participant relations continue? |
| `protocol` | Which procedures, rules, algorithms, practices, rituals, invariants, or transformation constraints continue? |
| `text-schema` | Which documents, code structures, schemas, recipes, records, manuscripts, or machine-readable contracts continue? |
| `purpose-meaning` | Which declared purposes, obligations, semantic commitments, questions, or intended functions continue? |
| `representation-story` | Which names, symbols, narratives, visual forms, myths, branding, legends, metaphors, or public descriptions continue? |

Evidence in one lane does not silently establish another. In particular:

```text
representation-story != identity
participants != authority
custody != authority or authorship
text-schema != protocol
purpose-meaning != historical occurrence
```

A lane may explicitly list other lanes it does not establish. That declaration is evidence-preserving metadata, not a substitute for declaring the target lane itself.

## Modes

Each declared lane has exactly one mode:

| Mode | Meaning |
| --- | --- |
| `preserved` | Materially continuous for the declared purpose without a constitutive change in that lane. |
| `transformed` | Continuous through an evidenced transformation. |
| `transferred` | A relation or responsibility crossed from one carrier to another through an evidenced handoff. |
| `reconstituted` | Newly constituted from surviving material after a material break or gap. |
| `lost` | The property or carrier did not survive the boundary. |
| `broken` | Evidence positively establishes that the continuity relation was interrupted. |
| `unresolved` | Available evidence does not justify a stronger classification. |

`reconstituted` is intentionally not an alias for `preserved`. `broken` is intentionally stronger than merely saying something was absent. Slash-separated or blended modes are non-conforming.

## Non-transitivity

Continuity edges do not compose automatically.

Given:

```text
A --representation-story/preserved--> B
B --participants/preserved--> C
```

Project 0 does not infer:

```text
A --identity/preserved--> C
```

Nor does it automatically infer a long-line edge in either source lane. A proposed long-line claim must be a new explicit claim. `checkLaneComposition(...)` can only evaluate that proposed claim; Project 0 exposes no automatic genealogy builder.

For explicit same-lane composition, v0 requires the proposed claim to cite the supplied parent continuity refs, close over every parent material root, and use parents that actually establish the requested lane. A known same-lane `broken` or `lost` parent refuses an uninterrupted `preserved`, `transformed`, or `transferred` claim.

The public API intentionally exposes no `composeClaims` or `inferLane` capability.

## Witness not warrant

> **Continuity may explain succession. It does not perform succession.**

The `authority` lane is intentionally asymmetric. A braid may carry exact references to external authority evidence and report the declared authority-continuity mode. The braid does not admit, validate, mint, renew, execute, spend, or transfer that authority.

`deriveStillAlive(...)` therefore reports authority with:

```text
portableEffect = none
externalAdmissionRequired = true
```

Copying, serializing, retrieving, spreading, or `structuredClone`-ing a continuity claim grants nothing. A warrant-looking string under custody, protocol, identity, purpose, or representation remains evidence under that lane and does not become authority continuity.

The public continuity surface intentionally exposes no `grantAuthority`, `executeAuthority`, or `admitWarrant` capability.

## Gaps and reconstitution

A system may preserve descent without pretending an interruption never occurred.

If a protocol is positively known to have broken, a later descendant may lawfully cite the surviving material and declare:

```text
protocol: reconstituted
```

when parent refs and material roots close. The same broken parent cannot be rewritten as uninterrupted `protocol: preserved` merely to produce a cleaner story.

Residuals are part of the addressed claim. Removing a residual changes claim identity. Similarity notes cannot stand in for a missing material root. Environment identity is also part of decompression: decoder or runtime drift changes the addressed continuity claim when it changes the declared environment.

Plural lawful continuations are allowed. Two descendants may share roots and purpose while remaining address-distinct because their outputs or other declared braid evidence differ.

## Continuity Spine boundary

Typed Continuity Braid and Continuity Spine solve different questions.

**Braid asks: what kinds of continuity crossed this boundary?**

**Spine asks: when may staged overlap, transfer, witness, and shedding move responsibility between carriers?**

The Spine's high-level sequence remains:

```text
A
→ grow B
→ A + B overlap
→ transfer responsibility
→ witness transfer
→ B bears dependency
→ shed obsolete scaffold
```

The Braid can describe lane-local state at those gates. It does not decide when a project has enough continuity to shed a carrier, select a route, or grant authority. Local systems remain sovereign over those admissions.

## Non-normative adapter direction

Downstream adoption is **not part of this implementation PR**. Project 0 imports none of the systems below.

Possible later adapters are directional examples only:

- **TranchNode:** map a real boundary specimen into braid lanes without weakening TranchNode's stronger artifact-root, residual, projection, and lineage laws.
- **Corpus OS:** map a Continuity Attestation / WorldCut succession specimen while proving that continuity evidence can explain authority succession without performing succession or admitting a warrant.
- **National Treasure:** use historical cases as adversarial pressure for false genealogy, revival, property succession, symbolic inheritance, participant change, and broken institutional lines. Research remains evidence/test pressure, never substrate authority.
- **The Haunted Toaster:** map candidate ancestry, transformations, source material, protocol/text continuity, and influence-only memory without turning lineage into renderer or execution authority.
- **Other products:** adapt locally only when the eight coarse lanes preserve rather than flatten the receiving system's stronger semantics.

Before shared adapter helpers or graduation from experimental status, at least two materially different downstream adapters should work without semantic weakening.

## Portable read-model questions

The v0 seam exposes two pure, frozen, deterministic projections:

- `deriveWhyCurrent(...)`: exact attributable subject, purpose, material roots, parent continuity refs, environment, outputs, and typed lanes.
- `deriveStillAlive(...)`: continuing, unresolved, and ended lanes; residuals; and explicitly non-operative authority continuity evidence.

These are shared questions and portable data projections. They are not one shared UI, narrative generator, state daemon, or currentness authority.

## Boundary summary

Typed Continuity Braid v0 can verify a bounded claim of this form:

> **This is a deterministic, root-closed, purpose-relative Typed Continuity Braid. Every claimed lane is explicit. Evidence in one lane cannot silently manufacture a stronger genealogy in another. Breakage and lawful reconstitution remain visible. Reconstruction does not impersonate occurrence. The witness grants no authority.**
