import * as crypto from 'crypto';
import { canonicalize } from 'json-canonicalize';
import bs58 from 'bs58';

export const DOMAIN_PREFIXES = {
  Node: 'Project0-Node-v1|',
  Edge: 'Project0-Edge-v1|',
  Receipt: 'Project0-Receipt-v1|',
  Request: 'Project0-Request-v1|',
};

// Strict pre-canonicalization validation
export function validateForCanonicalization(obj: any, seen = new WeakSet()): void {
  if (obj === undefined) throw new Error("UNDEFINED_VALUE");
  if (typeof obj === 'number') {
    if (Number.isNaN(obj)) throw new Error("NON_FINITE_NUMBER");
    if (!Number.isFinite(obj)) throw new Error("NON_FINITE_NUMBER");
  }
  if (typeof obj === 'bigint') throw new Error("UNSUPPORTED_TYPE");
  if (typeof obj === 'symbol') throw new Error("UNSUPPORTED_TYPE");
  if (typeof obj === 'function') throw new Error("UNSUPPORTED_TYPE");

  if (typeof obj === 'string') {
    // Check for lone surrogates
    for (let i = 0; i < obj.length; i++) {
      const code = obj.charCodeAt(i);
      if (code >= 0xD800 && code <= 0xDFFF) {
        if (code <= 0xDBFF) { // High surrogate
          if (i === obj.length - 1) throw new Error("LONE_SURROGATE");
          const next = obj.charCodeAt(i + 1);
          if (next < 0xDC00 || next > 0xDFFF) throw new Error("LONE_SURROGATE");
          i++; // Skip low surrogate
        } else { // Low surrogate without preceding high
          throw new Error("LONE_SURROGATE");
        }
      }
    }
  }

  if (typeof obj === 'object' && obj !== null) {
    if (Object.prototype.toString.call(obj) !== '[object Object]' && !Array.isArray(obj)) {
       throw new Error("UNSUPPORTED_TYPE"); // Rejects Date, Map, Set, ArrayBuffer, RegExp
    }

    if (seen.has(obj)) throw new Error("CYCLIC_VALUE");
    seen.add(obj);

    if (Array.isArray(obj)) {
      // Check for array holes
      if (Object.keys(obj).length !== obj.length) throw new Error("SPARSE_ARRAY");
      for (let i = 0; i < obj.length; i++) {
        validateForCanonicalization(obj[i], seen);
      }
    } else {
      for (const key of Object.keys(obj)) {
        if (obj[key] === undefined) throw new Error("UNDEFINED_VALUE");
        validateForCanonicalization(obj[key], seen);
      }
    }
    seen.delete(obj);
  }
}

function assertField(obj: any, field: string) {
  if (!(field in obj) || obj[field] === undefined) {
    throw new Error(`Missing required field: ${field}`);
  }
  return obj[field];
}

// Explicit constructor for Node Hashed Body
export function constructNodeBody(node: any): any {
  return {
    kind: assertField(node, 'kind'),
    body: assertField(node, 'body'),
    createdAt: assertField(node, 'createdAt'),
    createdBy: assertField(node, 'createdBy'),
    provenance: assertField(node, 'provenance'),
    disclosure: assertField(node, 'disclosure')
  };
}

// Explicit constructor for Edge Hashed Body
export function constructEdgeBody(edge: any): any {
  const body: any = {
    type: assertField(edge, 'type'),
    from: assertField(edge, 'from'),
    to: assertField(edge, 'to'),
    assertedBy: assertField(edge, 'assertedBy'),
    createdAt: assertField(edge, 'createdAt'),
    scopeId: assertField(edge, 'scopeId'),
    disclosure: assertField(edge, 'disclosure')
  };

  if ('basis' in edge) body.basis = edge.basis;
  if ('validFrom' in edge) body.validFrom = edge.validFrom;
  if ('validUntil' in edge) body.validUntil = edge.validUntil;
  return body;
}

// Explicit constructor for Receipt Hashed Body
export function constructReceiptBody(receipt: any): any {
  return {
    receiptType: assertField(receipt, 'receiptType'),
    issuedAt: assertField(receipt, 'issuedAt'),
    issuer: assertField(receipt, 'issuer'),
    subject: assertField(receipt, 'subject'),
    inputs: assertField(receipt, 'inputs'),
    outputs: assertField(receipt, 'outputs'),
    authorityRef: receipt.authorityRef !== undefined ? receipt.authorityRef : null,
    policyRefs: assertField(receipt, 'policyRefs'),
    previousReceiptRefs: assertField(receipt, 'previousReceiptRefs')
  };
}

// Explicit constructor for Request Hashed Body
export function constructRequestBody(request: any): any {
  return {
    requester: assertField(request, 'requester'),
    actor: assertField(request, 'actor'),
    purpose: assertField(request, 'purpose'),
    destinationScopeId: assertField(request, 'destinationScopeId'),
    status: assertField(request, 'status')
  };
}

export function computeSemanticAddress(type: 'Node' | 'Edge' | 'Receipt' | 'Request', body: any): { canonicalBytes: Buffer, textualId: string, digestHex: string } {
  let hashedBody;
  if (type === 'Node') hashedBody = constructNodeBody(body);
  else if (type === 'Edge') hashedBody = constructEdgeBody(body);
  else if (type === 'Receipt') hashedBody = constructReceiptBody(body);
  else if (type === 'Request') hashedBody = constructRequestBody(body);

  validateForCanonicalization(hashedBody);
  const jcsString = canonicalize(hashedBody);
  if (jcsString === undefined) throw new Error("Canonicalization failed");

  const prefix = DOMAIN_PREFIXES[type];
  const canonicalBytes = Buffer.concat([
    Buffer.from(prefix, 'utf8'),
    Buffer.from(jcsString, 'utf8')
  ]);

  const hash = crypto.createHash('sha256').update(canonicalBytes).digest();
  const digestHex = hash.toString('hex');
  const b58 = bs58.encode(hash);

  const prefixMap = {
    Node: 'node-',
    Edge: 'edge-',
    Receipt: 'rect-',
    Request: 'reqt-'
  };

  return { canonicalBytes, textualId: `${prefixMap[type]}${b58}`, digestHex };
}

export function computeArtifactAddress(rawBytes: Buffer): { digestHex: string, textualId: string } {
  const hash = crypto.createHash('sha256').update(rawBytes).digest();
  const digestHex = hash.toString('hex');
  return { digestHex, textualId: digestHex };
}

export function parseSemanticAddress(address: string, expectedType?: 'Node' | 'Edge' | 'Receipt' | 'Request'): { digest: Buffer, prefix: string } {
  const parts = address.split('-');
  if (parts.length !== 2) throw new Error('INVALID_ADDRESS_PREFIX');

  const prefixMap: any = {
    'node': 'Node',
    'edge': 'Edge',
    'rect': 'Receipt',
    'reqt': 'Request'
  };

  if (!prefixMap[parts[0]]) throw new Error('INVALID_ADDRESS_PREFIX');
  if (expectedType && prefixMap[parts[0]] !== expectedType) throw new Error('INVALID_ADDRESS_PREFIX');

  // Verify Base58 alphabet exactly
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(parts[1])) throw new Error('INVALID_ADDRESS_ALPHABET');

  let digest: Buffer;
  try {
    digest = Buffer.from(bs58.decode(parts[1]));
  } catch(e) {
    throw new Error('INVALID_ADDRESS_ALPHABET');
  }

  if (digest.length !== 32) throw new Error('INVALID_ADDRESS_LENGTH');

  return { digest, prefix: parts[0] };
}
