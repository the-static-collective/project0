import * as crypto from 'crypto';
import { canonicalize } from 'json-canonicalize';
import bs58 from 'bs58';

export const DOMAIN_PREFIXES = {
  Node: 'Project0-Node-v1|',
  Edge: 'Project0-Edge-v1|',
  Receipt: 'Project0-Receipt-v1|',
  Request: 'Project0-Request-v1|',
};

// Strict timestamp validation
const TIMESTAMP_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
export function validateTimestamp(ts: any): void {
  if (typeof ts !== 'string') throw new Error("INVALID_TYPE");
  if (!TIMESTAMP_REGEX.test(ts)) throw new Error("INVALID_TIMESTAMP");

  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) throw new Error("INVALID_TIMESTAMP");

  // JS Date.toISOString() always outputs milliseconds.
  // We need to compare to make sure leap days/months didn't wrap silently.
  const isoStr = d.toISOString();
  // If the input was e.g. "2026-08-01T22:17:39Z", JS outputs "2026-08-01T22:17:39.000Z"
  const expectedIso = ts.includes('.') ? ts : ts.replace('Z', '.000Z');
  if (isoStr !== expectedIso) throw new Error("INVALID_TIMESTAMP");
}

// Strict pre-canonicalization validation
export function validateForCanonicalization(obj: any, seen = new WeakSet()): void {
  if (obj === undefined) throw new Error("UNDEFINED_VALUE");
  if (typeof obj === 'number') {
    if (Number.isNaN(obj) || !Number.isFinite(obj)) throw new Error("NON_FINITE_NUMBER");
  }
  if (typeof obj === 'bigint' || typeof obj === 'symbol' || typeof obj === 'function') {
    throw new Error("UNSUPPORTED_TYPE");
  }

  if (typeof obj === 'string') {
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
    const proto = Object.getPrototypeOf(obj);
    if (proto !== Object.prototype && proto !== Array.prototype && proto !== null) {
      throw new Error("CUSTOM_PROTOTYPE");
    }

    if (Object.getOwnPropertySymbols(obj).length > 0) {
      throw new Error("SYMBOL_KEYED_PROPERTY");
    }

    const descriptors = Object.getOwnPropertyDescriptors(obj);
    const keys = Object.keys(descriptors);
    for (const key of keys) {
      const desc = descriptors[key];
      if (desc.get || desc.set) throw new Error("ACCESSOR_PROPERTY");
      if (!desc.enumerable && !(Array.isArray(obj) && key === 'length')) {
        throw new Error("NON_ENUMERABLE_PROPERTY");
      }
    }

    if (seen.has(obj)) throw new Error("CYCLIC_VALUE");
    seen.add(obj);

    if (Array.isArray(obj)) {
      if (Object.keys(obj).length !== obj.length) throw new Error("SPARSE_ARRAY");
      for (let i = 0; i < obj.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(obj, i)) throw new Error("SPARSE_ARRAY");
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

function assertField(obj: any, field: string, typeType?: string) {
  if (!Object.prototype.hasOwnProperty.call(obj, field) || obj[field] === undefined) {
    throw new Error(`Missing required field: ${field}`);
  }
  if (typeType === 'array' && !Array.isArray(obj[field])) throw new Error("INVALID_TYPE");
  if (typeType === 'object' && (typeof obj[field] !== 'object' || obj[field] === null || Array.isArray(obj[field]))) throw new Error("INVALID_TYPE");
  if (typeType === 'string' && typeof obj[field] !== 'string') throw new Error("INVALID_TYPE");
  return obj[field];
}

// Explicit constructors
export function constructNodeBody(node: any): any {
  validateTimestamp(assertField(node, 'createdAt', 'string'));
  return {
    kind: assertField(node, 'kind', 'string'),
    body: assertField(node, 'body'),
    createdAt: node.createdAt,
    createdBy: assertField(node, 'createdBy', 'string'),
    provenance: assertField(node, 'provenance', 'array'),
    disclosure: assertField(node, 'disclosure', 'string')
  };
}

export function constructEdgeBody(edge: any): any {
  validateTimestamp(assertField(edge, 'createdAt', 'string'));
  const body: any = {
    type: assertField(edge, 'type', 'string'),
    from: assertField(edge, 'from', 'string'),
    to: assertField(edge, 'to', 'string'),
    assertedBy: assertField(edge, 'assertedBy', 'string'),
    createdAt: edge.createdAt,
    scopeId: assertField(edge, 'scopeId', 'string'),
    disclosure: assertField(edge, 'disclosure', 'string')
  };

  if (Object.prototype.hasOwnProperty.call(edge, 'basis')) body.basis = edge.basis;
  if (Object.prototype.hasOwnProperty.call(edge, 'validFrom')) {
    if (edge.validFrom !== null) validateTimestamp(edge.validFrom);
    body.validFrom = edge.validFrom;
  }
  if (Object.prototype.hasOwnProperty.call(edge, 'validUntil')) {
    if (edge.validUntil !== null) validateTimestamp(edge.validUntil);
    body.validUntil = edge.validUntil;
  }
  return body;
}

export function constructReceiptBody(receipt: any): any {
  validateTimestamp(assertField(receipt, 'issuedAt', 'string'));
  return {
    receiptType: assertField(receipt, 'receiptType', 'string'),
    issuedAt: receipt.issuedAt,
    issuer: assertField(receipt, 'issuer', 'string'),
    subject: assertField(receipt, 'subject', 'string'),
    inputs: assertField(receipt, 'inputs', 'object'),
    outputs: assertField(receipt, 'outputs', 'object'),
    authorityRef: Object.prototype.hasOwnProperty.call(receipt, 'authorityRef') ? receipt.authorityRef : null,
    policyRefs: assertField(receipt, 'policyRefs', 'array'),
    previousReceiptRefs: assertField(receipt, 'previousReceiptRefs', 'array')
  };
}

export function constructRequestBody(request: any): any {
  return {
    requester: assertField(request, 'requester', 'string'),
    actor: assertField(request, 'actor', 'string'),
    purpose: assertField(request, 'purpose', 'string'),
    destinationScopeId: assertField(request, 'destinationScopeId', 'string'),
    status: assertField(request, 'status', 'string')
  };
}

export function computeSemanticAddress(type: 'Node' | 'Edge' | 'Receipt' | 'Request', body: any): { canonicalBytes: Buffer, textualId: string, digestHex: string } {
  validateForCanonicalization(body);

  let hashedBody;
  if (type === 'Node') hashedBody = constructNodeBody(body);
  else if (type === 'Edge') hashedBody = constructEdgeBody(body);
  else if (type === 'Receipt') hashedBody = constructReceiptBody(body);
  else if (type === 'Request') hashedBody = constructRequestBody(body);

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
