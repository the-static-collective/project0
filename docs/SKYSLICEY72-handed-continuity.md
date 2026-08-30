# SKySLICEY72 — handed continuity candidate

**Status:** experimental continuity note · no frozen ontology change  
**Owner boundary:** Project0 may pressure portable continuity semantics; downstream products own their own branch UX and media workflows.

## Question

Can two histories with the same coarse endpoints remain distinguishable because their crossings have opposite handedness or different ordered braid histories?

The motivating exact math is ordinary:

```text
π : B_n -> S_n
σ_i != σ_i^-1
π(σ_i) = π(σ_i^-1)
```

Endpoint permutation can therefore forget a distinction retained by braid history.

## Candidate law

### `HANDEDNESS-PRESERVES-BECOMING-001`

> **A continuity projection that preserves endpoints but discards handed crossing may collapse distinct attributable histories.**

This is purpose-relative. Some consumers may lawfully need only the endpoint relation. Others may need the crossing history.

## Experimental receipt shape

Do not add these fields to the frozen ontology. A downstream/experimental continuity payload may carry references such as:

```json
{
  "phaseRef": "declared phase address",
  "localFrameRef": "declared orientation frame",
  "crossing": {
    "generator": "sigma-1",
    "sign": 1
  },
  "parentRefs": ["..."],
  "formationRef": "..."
}
```

The inverse crossing would retain the same generator locus with `sign: -1`.

The important rule is not the field names. It is:

```text
coarse endpoint equality
must not silently authorize
historical identity
```

## Y orientation as local frame

A three-arm Y has full orientation grammar:

```text
D3 ≅ S3
|D3| = 6
```

A candidate local orientation receipt may therefore identify one of six Y-frame states. The six states are not six commuting labels: reflection conjugates rotation to its inverse.

```text
r^3 = e
f^2 = e
f r f = r^-1
```

This supplies a compact local frame for branch/crossing experiments without making `Y` a Project0 primitive.

## Relationship to Typed Continuity Braid

The existing experimental Typed Continuity Braid already preserves explicit lanes, breakage/reconstitution, root closure, and non-transitivity by default. SKySLICEY72 pressures one additional question:

> when a lane crosses another lane, is the **orientation of the crossing** material to the declared continuity purpose?

If yes, the crossing orientation belongs in the purpose-relative receipt. If no, it may be lawfully quotiented.

## Storyship / creative-provenance implication

A downstream Storyship-like system may need to distinguish:

```text
same parent set
!=
same parental braid
```

For example, two creative descendants may cite the same sources while differing in the order and handedness by which those sources became jointly operative.

Project0 should not decide the artistic meaning. It should only make it possible for a downstream system to preserve the distinction without pretending it is universal.

## Non-collapses

```text
branch != crossing
crossing sign != moral polarity
orientation != authority
same parents != same formation
same endpoints != same continuity receipt
braid analogy != mandatory ontology
```

## Candidate conformance pressure

A future experimental fixture may present two histories with:

```text
same participants
same start nodes
same end nodes
same endpoint permutation
opposite crossing sign
```

Expected result: a coarse endpoint projection may equate them; a handed-history projection must not.

No runtime or ontology promotion is authorized by this note.

> **THE ENDPOINT MAY CLOSE WHILE THE BECOMING REMAINS DIFFERENT.**
