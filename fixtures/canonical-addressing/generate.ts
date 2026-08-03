import * as fs from 'fs';
import * as path from 'path';
import { computeSemanticAddress, computeArtifactAddress, DOMAIN_PREFIXES } from '../../src/canonical-addressing/index';
import bs58 from 'bs58';

const fixtures = [
  {
    name: 'valid_node',
    type: 'Node',
    input: { kind: 'claim', body: 'Hello', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'negative_zero',
    type: 'Node',
    input: { kind: 'claim', body: { num: -0 }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'exponent_boundaries',
    type: 'Node',
    input: { kind: 'claim', body: { a: 1e20, b: 1e-6 }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'null_vs_omitted_a',
    type: 'Node',
    input: { kind: 'claim', body: { a: 1 }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'null_vs_omitted_b',
    type: 'Node',
    input: { kind: 'claim', body: { a: 1, b: null }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'recursive_undefined',
    type: 'Node',
    input: { kind: 'claim', body: { a: 1, b: { c: undefined } }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' },
    expectReject: true,
    rejectionReason: 'undefined is not allowed'
  },
  {
    name: 'sparse_array',
    type: 'Node',
    input: { kind: 'claim', body: { arr: [1, , 3] }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' },
    expectReject: true,
    rejectionReason: 'Sparse arrays are not allowed'
  },
  {
    name: 'nan_and_infinities',
    type: 'Node',
    input: { kind: 'claim', body: { a: NaN, b: Infinity, c: -Infinity }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' },
    expectReject: true,
    rejectionReason: 'NaN is not allowed'
  },
  {
    name: 'unicode_composed',
    type: 'Node',
    input: { kind: 'claim', body: 'é', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'unicode_decomposed',
    type: 'Node',
    input: { kind: 'claim', body: 'é', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'unicode_non_bmp',
    type: 'Node',
    input: { kind: 'claim', body: '𐐷', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'lone_surrogate',
    type: 'Node',
    input: { kind: 'claim', body: '\uD800', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' },
    expectReject: true,
    rejectionReason: 'Lone high surrogate'
  },
  {
    name: 'key_order_a',
    type: 'Node',
    input: { kind: 'claim', body: { a: 1, b: 2 }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'key_order_b',
    type: 'Node',
    input: { kind: 'claim', body: { b: 2, a: 1 }, createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'array_order_a',
    type: 'Node',
    input: { kind: 'claim', body: [1, 2], createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'array_order_b',
    type: 'Node',
    input: { kind: 'claim', body: [2, 1], createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'minimally_different_a',
    type: 'Node',
    input: { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'minimally_different_b',
    type: 'Node',
    input: { kind: 'claim', body: 'b', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'self_reference_exclusion',
    type: 'Node',
    input: { id: 'node-123', signature: 'sig', canonicalHash: 'hash', kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' }
  },
  {
    name: 'binary_artifact_empty',
    type: 'Artifact',
    input: Buffer.from([])
  },
  {
    name: 'binary_artifact_arbitrary',
    type: 'Artifact',
    input: Buffer.from([0xDE, 0xAD, 0xBE, 0xEF])
  },
  {
    name: 'malformed_textual_hash_wrong_prefix',
    type: 'Node',
    malformedTextualAddress: true,
    input_address: 'invalid-QmV8RkH',
    expectReject: true
  },
  {
    name: 'malformed_textual_hash_bad_b58',
    type: 'Node',
    malformedTextualAddress: true,
    input_address: 'node-0OIl',
    expectReject: true
  },
  {
    name: 'malformed_textual_hash_bad_length',
    type: 'Node',
    malformedTextualAddress: true,
    input_address: 'node-' + bs58.encode(Buffer.from([1, 2, 3])),
    expectReject: true
  }
];

fixtures.forEach(fixture => {
  let output: any = {
    name: fixture.name,
    type: fixture.type
  };

  if (fixture.malformedTextualAddress) {
    output.malformedTextualAddress = true;
    output.input_address = fixture.input_address;
    output.expectedStatus = 'rejected';
  } else if (fixture.type === 'Artifact') {
    output.rawInputHex = (fixture.input as Buffer).toString('hex');
    const { digestHex, textualId } = computeArtifactAddress(fixture.input as Buffer);
    output.preimageHex = output.rawInputHex;
    output.digestHex = digestHex;
    output.textualAddress = textualId;
    output.expectedStatus = 'accepted';
  } else {
    output.input = fixture.input;
    try {
      const { canonicalBytes, textualId, digestHex } = computeSemanticAddress(fixture.type as any, fixture.input);
      const prefix = Buffer.from(DOMAIN_PREFIXES[fixture.type as 'Node' | 'Edge' | 'Receipt' | 'Request'], 'utf8');

      output.domainPrefixHex = prefix.toString('hex');
      output.preimageHex = canonicalBytes.toString('hex');
      output.digestHex = digestHex;
      output.textualAddress = textualId;
      output.expectedStatus = fixture.expectReject ? 'rejected' : 'accepted';

      if (fixture.expectReject) {
         console.warn(`WARN: ${fixture.name} was expected to reject but was accepted.`);
      }
    } catch (e: any) {
      if (fixture.expectReject) {
        output.expectedStatus = 'rejected';
        output.rejectionReason = e.message;
      } else {
        console.error(`ERROR: ${fixture.name} was expected to accept but rejected: ${e.message}`);
        throw e;
      }
    }
  }

  fs.writeFileSync(
    path.join(__dirname, `${fixture.name}.json`),
    JSON.stringify(output, null, 2)
  );
});
