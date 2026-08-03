import * as fs from 'fs';
import * as path from 'path';
import { computeHash, computeTextualId, getCanonicalBytes } from '../../src/canonical-addressing/index';

const fixtures = [
  {
    name: 'positive_node',
    type: 'Node',
    input: { kind: 'claim', body: 'Hello world', disclosure: 'public' }
  },
  {
    name: 'positive_receipt',
    type: 'Receipt',
    input: { receiptType: 'RevelationReceipt', issuer: 'user1', policyRefs: ['public'] }
  },
  {
    name: 'unordered_keys_a',
    type: 'Node',
    input: { a: 1, b: 2, c: 3 }
  },
  {
    name: 'unordered_keys_b',
    type: 'Node',
    input: { c: 3, a: 1, b: 2 }
  },
  {
    name: 'omitted_field',
    type: 'Node',
    input: { a: 1 }
  },
  {
    name: 'null_field',
    type: 'Node',
    input: { a: 1, b: null }
  },
  {
    name: 'minimally_different_a',
    type: 'Node',
    input: { text: 'Hello' }
  },
  {
    name: 'minimally_different_b',
    type: 'Node',
    input: { text: 'hello' }
  },
  {
    name: 'unicode',
    type: 'Node',
    input: { text: 'こんにちは世界' }
  },
  {
    name: 'numeric_precision',
    type: 'Node',
    input: { num: 1.000000000000 } // Serializes as 1 in JCS
  },
  {
    name: 'self_reference',
    type: 'Node',
    input: { id: 'node-1234', kind: 'claim', canonicalHash: 'hash', signature: 'sig', body: 'test' }
  },
  {
    name: 'timestamp',
    type: 'Node',
    input: { createdAt: '2026-08-01T22:17:39Z' }
  }
];

fixtures.forEach(fixture => {
  const prefix = fixture.type === 'Node' ? 'Project0-Node-v1|' : 'Project0-Receipt-v1|';
  const canonicalBytes = getCanonicalBytes(fixture.input, prefix);

  const output = {
    input: fixture.input,
    canonicalBytesString: canonicalBytes.toString('utf8'),
    canonicalBytesHex: canonicalBytes.toString('hex'),
    hash: computeHash(fixture.input, prefix),
    textualId: computeTextualId(fixture.input, fixture.type as any)
  };

  fs.writeFileSync(
    path.join(__dirname, `${fixture.name}.json`),
    JSON.stringify(output, null, 2)
  );
});
