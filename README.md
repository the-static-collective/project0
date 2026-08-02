# Project 0

**The shared meaning contract beneath the Static Collective ecosystem.**

Project 0 is the Lego floor: the smallest stable set of concepts that lets many applications, humans, and agents cooperate without silently redefining one another's world.

It is not an application, a universal database, or a command center. It defines the portable contracts that applications may implement:

- meaning-bearing objects and their lineage
- relationships as first-class structure
- bounded authority and disclosure
- claims, witnesses, and receipts
- tension, rejection, and revision without erasure
- continuity across models, interfaces, and time

## The governing idea

> Meaning is not contained in isolated objects. It becomes recoverable through preserved relationships among objects, observers, contexts, and time.

Project 0 therefore treats relationship as part of the decompression mechanism—not as metadata that may be discarded.

## Repository map

- [FOUNDATION.md](FOUNDATION.md) — purpose, boundaries, and design pressures
- [ONTOLOGY.md](ONTOLOGY.md) — the minimal shared language
- [INVARIANTS.md](INVARIANTS.md) — rules implementations must not violate
- [RELATIONSHIPS.md](RELATIONSHIPS.md) — relationship-first meaning and decompression
- [RECEIPTS.md](RECEIPTS.md) — evidence, lineage, authority, and witnessing
- [ECOSYSTEM.md](ECOSYSTEM.md) — how current projects relate without collapsing together
- [MERGE-CIRCUIT.md](MERGE-CIRCUIT.md) — independent claims, conformance receipts, contradiction receipts, and human merge authority
- [contract/edge-law.v0.1.json](contract/edge-law.v0.1.json) — exhaustive tuple, traversal, and TranchNode v0.1 adapter contract
- [contract/status.json](contract/status.json) — machine-readable floor and blocker status
- [AGENTS.md](AGENTS.md) — instructions for Jules and other coding agents
- [ROADMAP.md](ROADMAP.md) — staged path from contract to executable reference kernel

## Project boundaries

Project 0 owns shared semantics and conformance fixtures. Product repositories own their experiences, storage choices, workflows, and domain-specific rules.

A downstream project may extend the contract. It may not silently weaken or reinterpret it and still claim conformance.

## Status

**Floor 1.0 — meaning-contract formation. Issues #1, #3, #5, and #10 remain blocked; executable Floor 1.1 work is not yet authorized.**

The documents in this repository are normative drafts until a tagged release. Code should follow the contract; the contract should not be retrofitted to excuse accidental code.

Run `npm run check` before reporting that a normative correction is complete.
