"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("../../src/canonical-addressing/index");
const bs58_1 = __importDefault(require("bs58"));
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
        input_address: 'node-' + bs58_1.default.encode(Buffer.from([1, 2, 3])),
        expectReject: true
    }
];
fixtures.forEach(fixture => {
    let output = {
        name: fixture.name,
        type: fixture.type
    };
    if (fixture.malformedTextualAddress) {
        output.malformedTextualAddress = true;
        output.input_address = fixture.input_address;
        output.expectedStatus = 'rejected';
    }
    else if (fixture.type === 'Artifact') {
        output.rawInputHex = fixture.input.toString('hex');
        const { digestHex, textualId } = (0, index_1.computeArtifactAddress)(fixture.input);
        output.preimageHex = output.rawInputHex;
        output.digestHex = digestHex;
        output.textualAddress = textualId;
        output.expectedStatus = 'accepted';
    }
    else {
        output.input = fixture.input;
        try {
            const { canonicalBytes, textualId, digestHex } = (0, index_1.computeSemanticAddress)(fixture.type, fixture.input);
            const prefix = Buffer.from(index_1.DOMAIN_PREFIXES[fixture.type], 'utf8');
            output.domainPrefixHex = prefix.toString('hex');
            output.preimageHex = canonicalBytes.toString('hex');
            output.digestHex = digestHex;
            output.textualAddress = textualId;
            output.expectedStatus = fixture.expectReject ? 'rejected' : 'accepted';
            if (fixture.expectReject) {
                console.warn(`WARN: ${fixture.name} was expected to reject but was accepted.`);
            }
        }
        catch (e) {
            if (fixture.expectReject) {
                output.expectedStatus = 'rejected';
                output.rejectionReason = e.message;
            }
            else {
                console.error(`ERROR: ${fixture.name} was expected to accept but rejected: ${e.message}`);
                throw e;
            }
        }
    }
    fs.writeFileSync(path.join(__dirname, `${fixture.name}.json`), JSON.stringify(output, null, 2));
});
