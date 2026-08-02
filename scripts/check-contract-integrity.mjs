import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const json = (path) => JSON.parse(read(path));
const fail = (message) => {
  console.error(`contract-integrity: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};
const unique = (values) => new Set(values).size === values.length;
const tupleKey = ({ type, from, to }) => `${type}|${from}|${to}`;

const law = json("contract/edge-law.v0.1.json");
const status = json("contract/status.json");
const relationships = read("RELATIONSHIPS.md");
const receipts = read("RECEIPTS.md");
const invariants = read("INVARIANTS.md");
const ecosystem = read("ECOSYSTEM.md");

assert(law.nodeKinds.length === 9 && unique(law.nodeKinds), "node kind set must contain exactly 9 unique values");
assert(law.edgeTypes.length === 21 && unique(law.edgeTypes), "edge type set must contain exactly 21 unique values");
assert(law.traversal.length === 21, "traversal classification must contain exactly 21 rows");
assert(unique(law.traversal.map(({ type }) => type)), "traversal edge types must be unique");
assert(law.edgeTypes.every((type) => law.traversal.some((row) => row.type === type)), "every edge type needs one traversal row");

const tupleKeys = law.validTuples.map(tupleKey);
const mappingKeys = law.tranchnodeV01.mappings.map(tupleKey);
assert(unique(tupleKeys), "valid tuple list contains duplicates");
assert(unique(mappingKeys), "adapter mapping contains duplicate tuples");
assert(tupleKeys.length === mappingKeys.length, "every valid tuple needs exactly one adapter mapping");
assert(tupleKeys.every((key) => mappingKeys.includes(key)), "adapter mapping omits a valid tuple");

const nativeTargets = new Set(law.tranchnodeV01.edgeKinds);
const operationTargets = new Set(["dispute_edge", "supersede_edge"]);
for (const mapping of law.tranchnodeV01.mappings) {
  if (mapping.category === "unavailable") {
    assert(mapping.target === null, `unavailable mapping ${tupleKey(mapping)} must have a null target`);
    continue;
  }
  assert(nativeTargets.has(mapping.target) || operationTargets.has(mapping.target), `mapping ${tupleKey(mapping)} names a non-TranchNode target`);
  if (mapping.category === "lossy") {
    assert(typeof mapping.loss === "string" && mapping.loss.length > 0, `lossy mapping ${tupleKey(mapping)} must name what is lost`);
  }
  if (mapping.category === "operation") {
    assert(mapping.requiredFields.length >= 4, `operation mapping ${tupleKey(mapping)} must bind all required fields`);
  }
}

for (const type of law.edgeTypes) {
  assert(relationships.includes(`| \`${type}\` |`), `RELATIONSHIPS.md is missing the traversal row for ${type}`);
}

assert(!ecosystem.includes("nearest \`EdgeKind\`"), "adapter must never select a nearest EdgeKind");
assert(!relationships.includes("cryptographic tie-breaking"), "ordering must not assume cryptographic IDs before Issue #5");
assert(!relationships.includes("evaluates order based on \`createdAt\`"), "TranchNode never uses createdAt as durable order");

for (const field of ["requester", "purpose", "destinationScopeId", "status", "validFrom", "validUntil"]) {
  assert(receipts.includes(`\`${field}\``), `declared Request envelope is missing ${field}`);
}
assert(relationships.includes("receipt.outputs.requestRef"), "bridge predicate must resolve RevelationReceipt.outputs.requestRef");
assert(relationships.includes("getRequest(requestRef)"), "bridge predicate must resolve the exact Request by ID");
assert(invariants.includes("`requestRef`: req1"), "positive bridge fixture must bind R1 to Req1");
assert(invariants.includes("`requester`: humanX"), "positive bridge fixture must bind requester identity");

assert(JSON.stringify(status.blockedIssues) === JSON.stringify([1, 3, 5, 10]), "issues 1, 3, 5, and 10 must remain blocked");
assert(status.executionImplementationAllowed === false, "execution implementation must remain blocked");

const eventPath = process.env.GITHUB_EVENT_PATH;
if (eventPath && fs.existsSync(eventPath)) {
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
  const body = event.pull_request?.body ?? "";
  if (event.pull_request) {
    for (const heading of ["## Change receipt", "### Meaning claim", "### Invariants", "### Fixtures", "### Compatibility", "### Evidence", "### Unresolved tensions", "### Authority boundary"]) {
      assert(body.includes(heading), `pull request body is missing ${heading}`);
    }
    assert(!/(#1|#3|#5|#10)[\s\S]{0,120}\bunblocked\b/i.test(body), "PR body contradicts the blocked-issue ledger");
  }
}

if (!process.exitCode) {
  console.log(`contract-integrity: ok — ${law.nodeKinds.length} node kinds, ${law.edgeTypes.length} edge types, ${law.validTuples.length} tuples`);
}
