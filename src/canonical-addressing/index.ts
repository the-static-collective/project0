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
export type SemanticAddressKind = keyof typeof DOMAIN_PREFIXES;

function validateString(value: string): void {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 0xD800 || code > 0xDFFF) continue;
    if (code <= 0xDBFF) {
      if (i === value.length - 1) throw new Error("Lone high surrogate");
      const next = value.charCodeAt(i + 1);
      if (next < 0xDC00 || next > 0xDFFF) throw new Error("Lone high surrogate");
      i++;
      continue;
    }
    throw new Error("Lone low surrogate");
  }
}

export function validateTimestamp(val: unknown): void {
  if (typeof val !== 'string') throw new Error("Timestamp must be a string");

  // Enforce strict ISO 8601 UTC format. Must end with Z and have valid components.
  // Example: 2026-08-03T00:00:00.000Z or 2026-08-01T22:17:39Z
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?Z$/;
  if (!regex.test(val)) throw new Error("Invalid timestamp format");

  const timestamp = Date.parse(val);
  if (Number.isNaN(timestamp)) throw new Error("Invalid timestamp value");

  const d = new Date(timestamp);
  const isoString = d.toISOString();
  // If the original has no milliseconds, compare without milliseconds
  if (val.endsWith('Z') && !val.includes('.')) {
    if (isoString.replace('.000', '') !== val) throw new Error("Invalid timestamp value");
  } else if (isoString !== val) {
    const [year, month, day] = val.split('T')[0].split('-');
    if (d.getUTCFullYear() !== parseInt(year) ||
        d.getUTCMonth() + 1 !== parseInt(month) ||
        d.getUTCDate() !== parseInt(day)) {
        throw new Error("Invalid timestamp value");
    }
  }
}

export function validateForCanonicalization(obj: unknown, seen = new WeakSet<object>(), depth = 0): void {
  if (depth > 100) throw new Error("Maximum depth exceeded");
  if (obj === undefined) throw new Error("undefined is not allowed");
  if (typeof obj === 'number') {
    if (Number.isNaN(obj)) throw new Error("NaN is not allowed");
    if (!Number.isFinite(obj)) throw new Error("Infinity is not allowed");
  }
  if (typeof obj === 'bigint') throw new Error("bigint is not allowed");
  if (typeof obj === 'symbol') throw new Error("symbol is not allowed");
  if (typeof obj === 'function') throw new Error("function is not allowed");

  if (typeof obj === 'string') validateString(obj);

  if (typeof obj === 'object' && obj !== null) {
    if (seen.has(obj)) throw new Error("Cyclic object detected");
    seen.add(obj);

    if (Array.isArray(obj)) {
      // Check for array holes
      if (Object.keys(obj).length !== obj.length) throw new Error("Sparse arrays are not allowed");
      for (let i = 0; i < obj.length; i++) {
        validateForCanonicalization(obj[i], seen, depth + 1);
      }
    } else {
      if (Object.getPrototypeOf(obj) !== Object.prototype) {
        throw new Error("Only plain objects are allowed");
      }
      for (const key of Object.keys(obj)) {
        validateString(key);
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        if (descriptor === undefined || "get" in descriptor || "set" in descriptor) {
          throw new Error("Accessor properties are not allowed");
        }
        if (descriptor.value === undefined) throw new Error("undefined property values are not allowed");
        validateForCanonicalization(descriptor.value, seen, depth + 1);
      }
    }
    seen.delete(obj);
  }
}

// Explicit constructor for Node Hashed Body
export function constructNodeBody(node: any): any {
  if (node.createdAt !== undefined) validateTimestamp(node.createdAt);
  return {
    kind: node.kind,
    body: node.body,
    createdAt: node.createdAt,
    createdBy: node.createdBy,
    provenance: node.provenance,
    disclosure: node.disclosure
  };
}

// Explicit constructor for Edge Hashed Body
export function constructEdgeBody(edge: any): any {
  if (edge.createdAt !== undefined) validateTimestamp(edge.createdAt);
  if (edge.validFrom !== undefined && edge.validFrom !== null) validateTimestamp(edge.validFrom);
  if (edge.validUntil !== undefined && edge.validUntil !== null) validateTimestamp(edge.validUntil);
  return {
    type: edge.type,
    from: edge.from,
    to: edge.to,
    assertedBy: edge.assertedBy,
    createdAt: edge.createdAt,
    scopeId: edge.scopeId,
    basis: edge.basis,
    disclosure: edge.disclosure,
    validFrom: edge.validFrom !== undefined ? edge.validFrom : null,
    validUntil: edge.validUntil !== undefined ? edge.validUntil : null
  };
}

// Explicit constructor for Receipt Hashed Body
export function constructReceiptBody(receipt: any): any {
  if (receipt.issuedAt !== undefined) validateTimestamp(receipt.issuedAt);
  return {
    receiptType: receipt.receiptType,
    issuedAt: receipt.issuedAt,
    issuer: receipt.issuer,
    subject: receipt.subject,
    inputs: receipt.inputs,
    outputs: receipt.outputs,
    authorityRef: receipt.authorityRef,
    policyRefs: receipt.policyRefs,
    previousReceiptRefs: receipt.previousReceiptRefs
  };
}

// Explicit constructor for Request Hashed Body
export function constructRequestBody(request: any): any {
  return {
    requester: request.requester,
    actor: request.actor,
    purpose: request.purpose,
    destinationScopeId: request.destinationScopeId,
    status: request.status
  };
}

export function computeSemanticAddress(type: SemanticAddressKind, body: any): { canonicalBytes: Buffer, textualId: string, digestHex: string } {
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

export function parseSemanticAddress(type: SemanticAddressKind, textualId: string): Buffer {
  const prefixMap: Record<SemanticAddressKind, string> = {
    Node: 'node-',
    Edge: 'edge-',
    Receipt: 'rect-',
    Request: 'reqt-'
  };
  const prefix = prefixMap[type];
  if (!textualId.startsWith(prefix)) throw new Error(`Invalid ${type} address prefix`);
  const encodedDigest = textualId.slice(prefix.length);
  if (encodedDigest.length === 0) throw new Error("Missing address digest");
  let digest: Uint8Array;
  try {
    digest = bs58.decode(encodedDigest);
  } catch {
    throw new Error("Invalid base58 address digest");
  }
  if (digest.length !== 32) throw new Error("Invalid address digest length");
  return Buffer.from(digest);
}

export function computeArtifactAddress(rawBytes: Uint8Array): { digestHex: string, textualId: string } {
  const hash = crypto.createHash('sha256').update(rawBytes).digest();
  const digestHex = hash.toString('hex');
  return { digestHex, textualId: digestHex };
}
