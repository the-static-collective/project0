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
| Dialogic | `answers`, `asks`, `rebuttal_to`, `continues` |
| Authority | `delegates`, `consumes`, `revokes`, `permits_disclosure` |
| Temporal | `precedes`, `overlaps`, `supersedes` |
| Product | downstream namespaced relationships |

## Local collapse, never final collapse

An application may produce a local interpretation for a particular purpose. That interpretation is a new attributable node. It does not become the artifact's final meaning.

Repeated observation may create new states and new relationships. The graph keeps those collapses inspectable rather than pretending they never happened.

## Compression requirement

A compressed representation is adequate only if its declared decoder can restore the relationships required for the intended use. Smaller bytes with severed lineage are loss, even when the prose survives.
