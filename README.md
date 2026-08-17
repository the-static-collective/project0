# Project 0

**The shared meaning contract beneath the Static Collective ecosystem.**

Project 0 is the Lego floor: the smallest stable set of concepts that lets many applications, humans, and agents cooperate without silently redefining one another's world.

It is not an application, a universal database, or a command center. It defines portable contracts and executable reference seams that applications may implement:

- meaning-bearing objects and their lineage;
- relationships as first-class structure;
- bounded authority and disclosure;
- claims, witnesses, and receipts;
- tension, rejection, and revision without erasure;
- continuity across models, interfaces, and time;
- bounded crossings whose transport does not inherit source authority.

## The governing idea

> Meaning is not contained in isolated objects. It becomes recoverable through preserved relationships among objects, observers, contexts, and time.

Project 0 therefore treats relationship as part of the decompression mechanism—not as metadata that may be discarded.

## Current executable surface

Project 0 has moved beyond document-only Floor 1.0 formation.

The repository now contains:

- the deterministic **Floor 1.1 reference kernel**, including canonical domain contracts, append-only receipt graph behavior, bounded authority consumption, and offline conformance evidence;
- advanced Floor 1.1 conformance proofs for sealed plurality, repair scars, and monument/build-beside behavior;
- **NAV v0.1** declaration, comparison, addressing, and crossing-witness machinery, including one fixture-only Project0 → Corpus OS crossing proof;
- **World Encounter Envelope v0.1**, which preserves bounded encounter testimony without treating transported testimony as source authority;
- a bounded stdio adapter for World Encounter so another local process can submit supported operations without importing Project 0 internals.

Run the full proof surface with:

```bash
npm install
npm run verify:all
```

Run only the World Encounter process boundary with:

```bash
npm run world-encounter:stdio
```

## Status

**Floor 1.2 — executable encounter boundary.**

The contract is now backed by a reference kernel, conformance fixtures, lawful-navigation witnesses, and a bounded local process seam. This remains an intentionally limited executable proof surface, not a claim of full ecosystem conformance or portable authority.

Machine-readable snapshot: [`PROJECT_STATUS.json`](PROJECT_STATUS.json).

## Repository map

- [FOUNDATION.md](FOUNDATION.md) — purpose, boundaries, and design pressures
- [ONTOLOGY.md](ONTOLOGY.md) — the minimal shared language
- [INVARIANTS.md](INVARIANTS.md) — rules implementations must not violate
- [RELATIONSHIPS.md](RELATIONSHIPS.md) — relationship-first meaning and decompression
- [RECEIPTS.md](RECEIPTS.md) — evidence, lineage, authority, and witnessing
- [ECOSYSTEM.md](ECOSYSTEM.md) — how current projects relate without collapsing together
- [AGENTS.md](AGENTS.md) — instructions for coding agents
- [ROADMAP.md](ROADMAP.md) — staged path from contract to executable reference kernel
- [`docs/`](docs/) — bounded designs, plans, and executable-specimen records
- [`fixtures/`](fixtures/) — deterministic conformance and crossing evidence

## Project boundaries

Project 0 owns shared semantics and conformance fixtures. Product repositories own their experiences, storage choices, workflows, and domain-specific rules.

A downstream project may extend the contract. It may not silently weaken or reinterpret it and still claim conformance.

Transport is also not authority. A World Encounter envelope can carry attributable testimony across a process boundary; the receiving system still decides what, if anything, that testimony may do.
