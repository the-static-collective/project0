import * as crypto from 'crypto';
import { canonicalize } from 'json-canonicalize';
import bs58 from 'bs58';

export const DOMAIN_PREFIXES = {
  Node: 'Project0-Node-v1|',
  Edge: 'Project0-Edge-v1|',
  Receipt: 'Project0-Receipt-v1|',
  Request: 'Project0-Request-v1|',
  Artifact: 'Project0-Artifact-v1|',
};

export function cleanObjectForHashing(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  const cleaned = Array.isArray(obj) ? [...obj] : { ...obj };

  if (!Array.isArray(cleaned)) {
    delete cleaned.id;
    delete cleaned.receiptId;
    delete cleaned.canonicalHash;
    delete cleaned.signature;
    delete cleaned.signatures;
  }
  return cleaned;
}

export function getCanonicalBytes(obj: any, domainPrefix: string): Buffer {
  const cleaned = cleanObjectForHashing(obj);
  const jcsString = canonicalize(cleaned) || '';
  return Buffer.concat([
    Buffer.from(domainPrefix, 'utf8'),
    Buffer.from(jcsString, 'utf8')
  ]);
}

export function computeHash(obj: any, domainPrefix: string): string {
  const bufferToHash = getCanonicalBytes(obj, domainPrefix);
  const hash = crypto.createHash('sha256').update(bufferToHash).digest();
  return bs58.encode(hash);
}

export function computeTextualId(obj: any, type: 'Node' | 'Edge' | 'Receipt' | 'Request' | 'Artifact'): string {
  const hash = computeHash(obj, DOMAIN_PREFIXES[type]);
  const prefixMap = {
    Node: 'node-',
    Edge: 'edge-',
    Receipt: 'rect-',
    Request: 'reqt-',
    Artifact: 'arti-'
  };
  return `${prefixMap[type]}${hash}`;
}
