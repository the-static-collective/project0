import * as fs from 'fs';
import * as path from 'path';
import { computeSemanticAddress, computeArtifactAddress, parseSemanticAddress } from './index';

const FIXTURE_DIR = path.join(__dirname, '../../fixtures/canonical-addressing');

describe('Cross-Runtime Fixture Verification', () => {
  const files = fs.readdirSync(FIXTURE_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    it(`verifies ${file}`, () => {
      const data = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, file), 'utf8'));

      if (data.type === 'Artifact') {
        const rawBytes = Buffer.from(data.rawInputHex, 'hex');
        const { digestHex, textualId } = computeArtifactAddress(rawBytes);
        expect(digestHex).toBe(data.digestHex);
        expect(textualId).toBe(data.textualAddress);
        return;
      }

      if (data.operation === 'reject_transport_state') {
        // Handled in `index.test.ts` via native TypeScript constraints.
        // The transport state cannot be securely parsed from JSON as it destroys the state (e.g. undefined).
        return;
      }

      if (data.malformedTextualAddress) {
        if (data.expectedStatus === 'rejected') {
          expect(() => parseSemanticAddress(data.input_address)).toThrow(data.expectedErrorCode);
        }
        return;
      }

      if (data.expectedStatus === 'rejected') {
        expect(() => computeSemanticAddress(data.type, data.input)).toThrow(data.expectedErrorCode);
      } else {
        const { canonicalBytes, textualId, digestHex } = computeSemanticAddress(data.type, data.input);

        expect(canonicalBytes.toString('hex')).toBe(data.preimageHex);
        expect(digestHex).toBe(data.digestHex);
        expect(textualId).toBe(data.textualAddress);
      }
    });
  }
});
