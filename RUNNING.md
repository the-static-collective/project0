# Running Project 0

Project 0 now includes a small executable reference kernel for resonance-motif transitions.

## Requirements

- Node.js 22 or later
- npm

## Start

```bash
npm install
npm run check
npm run demo
```

`npm run check` compiles the TypeScript kernel and runs its invariant tests.

`npm run demo` executes one complete spiral:

```text
source particular
→ rupture
→ tension
→ response
→ anchor transfiguration
→ recognition
→ successor source
```

The original source remains immutable. Every operation returns a successor motif revision and a transition receipt.

## Development loop

1. Add or modify a pure transition in `src/resonance.ts`.
2. Add the corresponding invariant test in `test/resonance.test.ts`.
3. Run `npm run check`.
4. Run `npm run demo` when the change affects the closed-loop behavior.
5. Update the normative documents or schema only when the executable behavior exposes a genuine contract decision.

## Current API

- `openMotif`
- `attachPosition`
- `proposeClosure`
- `recognizeClosure`
- `missingPositions`

This is deliberately an in-memory reference kernel. Persistence, networking, model providers, vector retrieval, and product UI remain outside the shared semantic floor until their contracts are proven necessary.
