import assert from "node:assert/strict";
import test from "node:test";

import {
  replayWholeReturn,
  resumeTokenFor,
  type WholeReturnDeclaration,
  type WholeReturnEvent,
} from "../src/whole-return/index";

const declaration: WholeReturnDeclaration = {
  version: "whole-return/v0",
  jobId: "token-job",
  occurrenceId: "token-occurrence",
  purpose: "prove public token generation derives lifecycle state",
  allowedOperations: ["measure"],
  completionCondition: "one crossing retained",
  participants: [
    {
      participantId: "a",
      repoRef: "example/a",
      revision: "rev-a",
      adapterVersion: "adapter-a/0",
      identityDomain: "domain-a",
    },
    {
      participantId: "b",
      repoRef: "example/b",
      revision: "rev-b",
      adapterVersion: "adapter-b/0",
      identityDomain: "domain-b",
    },
  ],
};

const events: WholeReturnEvent[] = [
  {
    kind: "crossing",
    seq: 1,
    eventId: "cross-1",
    fromParticipantId: "a",
    toParticipantId: "b",
    sourceIdentity: { domain: "domain-a", ref: "a://artifact/1" },
    destinationIdentity: { domain: "domain-b", ref: "b://observation/1" },
    sourceReceiptRef: "a://receipt/1",
    mappingReceiptRef: "b://receipt/1",
    sourceArtifactSha256: "d".repeat(64),
    acceptedArtifactSha256: "d".repeat(64),
  },
];

test("public resume token derives lifecycle status instead of accepting one from the caller", () => {
  const replay = replayWholeReturn(declaration, events);
  assert.equal(resumeTokenFor(declaration, events), replay.resumeToken);
});
