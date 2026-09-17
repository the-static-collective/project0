import assert from "node:assert/strict";
import test from "node:test";

import {
  replayWholeReturn,
  resumeTokenFor,
  validateWholeReturnDeclaration,
  type WholeReturnCrossingEvent,
  type WholeReturnDeclaration,
  type WholeReturnEvent,
} from "../src/whole-return/index";

const HASH_A = "a".repeat(64);
const HASH_B = "b".repeat(64);

function declaration(): WholeReturnDeclaration {
  return {
    version: "whole-return/v0",
    jobId: "job-toaster-dogram-001",
    occurrenceId: "occurrence-001",
    purpose: "measure one retained toaster experiment and return to native refs",
    allowedOperations: ["render", "measure", "retain", "resume"],
    completionCondition: "retain at least one return ref after witnessed crossings",
    participants: [
      {
        participantId: "toaster",
        repoRef: "the-static-collective/the-haunted-toaster",
        revision: "toaster-rev-1",
        adapterVersion: "toaster-whole-return/0",
        identityDomain: "toaster-artifact",
      },
      {
        participantId: "dogram",
        repoRef: "the-static-collective/Dogram",
        revision: "dogram-rev-1",
        adapterVersion: "dogram-whole-return/0",
        identityDomain: "dogram-observation",
      },
    ],
  };
}

function crossing(seq = 1, eventId = "event-cross-1"): WholeReturnCrossingEvent {
  return {
    kind: "crossing",
    seq,
    eventId,
    fromParticipantId: "toaster",
    toParticipantId: "dogram",
    sourceIdentity: { domain: "toaster-artifact", ref: "toaster://render/abc" },
    destinationIdentity: { domain: "dogram-observation", ref: "dogram://observation/xyz" },
    sourceReceiptRef: "toaster://receipt/render-abc",
    mappingReceiptRef: "dogram://receipt/import-xyz",
    sourceArtifactSha256: HASH_A,
    acceptedArtifactSha256: HASH_A,
  };
}

function completedJourney(): WholeReturnEvent[] {
  return [
    crossing(),
    { kind: "interrupt", seq: 2, eventId: "event-interrupt-1", reason: "process stopped after measurement" },
    { kind: "resume", seq: 3, eventId: "event-resume-1", interruptionEventId: "event-interrupt-1" },
    crossing(4, "event-cross-2"),
    {
      kind: "complete",
      seq: 5,
      eventId: "event-complete-1",
      returnRefs: [
        { domain: "toaster-artifact", ref: "toaster://render/abc" },
        { domain: "dogram-observation", ref: "dogram://observation/xyz" },
      ],
    },
  ];
}

test("replays one interrupted cross-repo journey through exact return", () => {
  const result = replayWholeReturn(declaration(), completedJourney());

  assert.equal(result.status, "completed");
  assert.deepEqual(result.crossingEventIds, ["event-cross-1", "event-cross-2"]);
  assert.deepEqual(result.returnRefs, [
    { domain: "toaster-artifact", ref: "toaster://render/abc" },
    { domain: "dogram-observation", ref: "dogram://observation/xyz" },
  ]);
  assert.match(result.resumeToken, /^whole-return-sha256:[0-9a-f]{64}$/);
});

test("accepts a fully locked declaration and rejects duplicate identity domains", () => {
  assert.doesNotThrow(() => validateWholeReturnDeclaration(declaration()));

  const invalid = declaration();
  invalid.participants[1].identityDomain = invalid.participants[0].identityDomain;
  assert.throws(() => validateWholeReturnDeclaration(invalid), /WHOLE_RETURN_DUPLICATE_IDENTITY_DOMAIN/);
});

test("artifact hash mismatch refuses the crossing", () => {
  const changed = crossing();
  changed.acceptedArtifactSha256 = HASH_B;

  assert.throws(
    () => replayWholeReturn(declaration(), [changed]),
    /WHOLE_RETURN_ARTIFACT_HASH_MISMATCH/,
  );
});

test("missing crossing receipts are rejected", () => {
  const missingSource = crossing();
  missingSource.sourceReceiptRef = "";
  assert.throws(
    () => replayWholeReturn(declaration(), [missingSource]),
    /WHOLE_RETURN_INVALID_RECEIPT_REF/,
  );

  const missingMapping = crossing();
  missingMapping.mappingReceiptRef = "   ";
  assert.throws(
    () => replayWholeReturn(declaration(), [missingMapping]),
    /WHOLE_RETURN_INVALID_RECEIPT_REF/,
  );
});

test("crossing identities must stay inside participant-native domains", () => {
  const invalid = crossing();
  invalid.sourceIdentity.domain = "universal-object-id";

  assert.throws(
    () => replayWholeReturn(declaration(), [invalid]),
    /WHOLE_RETURN_IDENTITY_DOMAIN_MISMATCH/,
  );
});

test("event sequence is contiguous and event IDs are unique", () => {
  assert.throws(
    () => replayWholeReturn(declaration(), [crossing(2)]),
    /WHOLE_RETURN_SEQUENCE_GAP/,
  );

  assert.throws(
    () => replayWholeReturn(declaration(), [crossing(), crossing(2, "event-cross-1")]),
    /WHOLE_RETURN_DUPLICATE_EVENT_ID/,
  );
});

test("an interrupted journey cannot cross until exact resume", () => {
  const events: WholeReturnEvent[] = [
    crossing(),
    { kind: "interrupt", seq: 2, eventId: "event-interrupt-1", reason: "stop" },
    crossing(3, "event-cross-2"),
  ];

  assert.throws(
    () => replayWholeReturn(declaration(), events),
    /WHOLE_RETURN_ILLEGAL_TRANSITION/,
  );
});

test("resume must answer the active interruption", () => {
  const events: WholeReturnEvent[] = [
    crossing(),
    { kind: "interrupt", seq: 2, eventId: "event-interrupt-1", reason: "stop" },
    { kind: "resume", seq: 3, eventId: "event-resume-1", interruptionEventId: "some-other-interruption" },
  ];

  assert.throws(
    () => replayWholeReturn(declaration(), events),
    /WHOLE_RETURN_RESUME_MISMATCH/,
  );
});

test("completed and refused states are terminal", () => {
  const afterComplete = [...completedJourney(), { kind: "refuse", seq: 6, eventId: "event-refuse-1", reasonCode: "late", evidenceRefs: [] } as WholeReturnEvent];
  assert.throws(
    () => replayWholeReturn(declaration(), afterComplete),
    /WHOLE_RETURN_ILLEGAL_TRANSITION/,
  );

  const afterRefuse: WholeReturnEvent[] = [
    { kind: "refuse", seq: 1, eventId: "event-refuse-1", reasonCode: "unsupported", evidenceRefs: [] },
    crossing(2),
  ];
  assert.throws(
    () => replayWholeReturn(declaration(), afterRefuse),
    /WHOLE_RETURN_ILLEGAL_TRANSITION/,
  );
});

test("completion requires at least one native return reference", () => {
  const events: WholeReturnEvent[] = [
    crossing(),
    { kind: "complete", seq: 2, eventId: "event-complete-1", returnRefs: [] },
  ];

  assert.throws(
    () => replayWholeReturn(declaration(), events),
    /WHOLE_RETURN_MISSING_RETURN_REF/,
  );
});

test("exact replay produces the same token", () => {
  const first = replayWholeReturn(declaration(), completedJourney());
  const second = replayWholeReturn(declaration(), completedJourney());

  assert.equal(first.resumeToken, second.resumeToken);
  assert.equal(
    first.resumeToken,
    resumeTokenFor(declaration(), completedJourney(), "completed"),
  );
});

test("changed participant revision or occurrence changes replay identity", () => {
  const base = replayWholeReturn(declaration(), [crossing()]);

  const changedRevision = declaration();
  changedRevision.participants[1].revision = "dogram-rev-2";
  const revisionReplay = replayWholeReturn(changedRevision, [crossing()]);
  assert.notEqual(base.resumeToken, revisionReplay.resumeToken);

  const newOccurrence = declaration();
  newOccurrence.occurrenceId = "occurrence-002";
  const newOccurrenceReplay = replayWholeReturn(newOccurrence, [crossing()]);
  assert.notEqual(base.resumeToken, newOccurrenceReplay.resumeToken);
});

test("replaying one occurrence does not manufacture a new occurrence", () => {
  const first = replayWholeReturn(declaration(), [crossing()]);
  const replay = replayWholeReturn(declaration(), [crossing()]);

  assert.equal(first.occurrenceId, "occurrence-001");
  assert.equal(replay.occurrenceId, first.occurrenceId);
  assert.equal(replay.resumeToken, first.resumeToken);
});
