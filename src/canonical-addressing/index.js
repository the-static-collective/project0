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
exports.DOMAIN_PREFIXES = void 0;
exports.constructNodeBody = constructNodeBody;
exports.constructEdgeBody = constructEdgeBody;
exports.constructReceiptBody = constructReceiptBody;
exports.constructRequestBody = constructRequestBody;
exports.computeSemanticAddress = computeSemanticAddress;
exports.computeArtifactAddress = computeArtifactAddress;
const crypto = __importStar(require("crypto"));
const json_canonicalize_1 = require("json-canonicalize");
const bs58_1 = __importDefault(require("bs58"));
exports.DOMAIN_PREFIXES = {
    Node: 'Project0-Node-v1|',
    Edge: 'Project0-Edge-v1|',
    Receipt: 'Project0-Receipt-v1|',
    Request: 'Project0-Request-v1|',
};
// Strict pre-canonicalization validation
function validateForCanonicalization(obj, seen = new WeakSet()) {
    if (obj === undefined)
        throw new Error("undefined is not allowed");
    if (typeof obj === 'number') {
        if (Number.isNaN(obj))
            throw new Error("NaN is not allowed");
        if (!Number.isFinite(obj))
            throw new Error("Infinity is not allowed");
    }
    if (typeof obj === 'bigint')
        throw new Error("bigint is not allowed");
    if (typeof obj === 'symbol')
        throw new Error("symbol is not allowed");
    if (typeof obj === 'function')
        throw new Error("function is not allowed");
    if (typeof obj === 'string') {
        // Check for lone surrogates
        for (let i = 0; i < obj.length; i++) {
            const code = obj.charCodeAt(i);
            if (code >= 0xD800 && code <= 0xDFFF) {
                if (code <= 0xDBFF) { // High surrogate
                    if (i === obj.length - 1)
                        throw new Error("Lone high surrogate");
                    const next = obj.charCodeAt(i + 1);
                    if (next < 0xDC00 || next > 0xDFFF)
                        throw new Error("Lone high surrogate");
                    i++; // Skip low surrogate
                }
                else { // Low surrogate without preceding high
                    throw new Error("Lone low surrogate");
                }
            }
        }
    }
    if (typeof obj === 'object' && obj !== null) {
        if (seen.has(obj))
            throw new Error("Cyclic object detected");
        seen.add(obj);
        if (Array.isArray(obj)) {
            // Check for array holes
            if (Object.keys(obj).length !== obj.length)
                throw new Error("Sparse arrays are not allowed");
            for (let i = 0; i < obj.length; i++) {
                validateForCanonicalization(obj[i], seen);
            }
        }
        else {
            for (const key of Object.keys(obj)) {
                if (obj[key] === undefined)
                    throw new Error("undefined property values are not allowed");
                validateForCanonicalization(obj[key], seen);
            }
        }
        seen.delete(obj);
    }
}
// Explicit constructor for Node Hashed Body
function constructNodeBody(node) {
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
function constructEdgeBody(edge) {
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
function constructReceiptBody(receipt) {
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
function constructRequestBody(request) {
    return {
        requester: request.requester,
        actor: request.actor,
        purpose: request.purpose,
        destinationScopeId: request.destinationScopeId,
        status: request.status
    };
}
function computeSemanticAddress(type, body) {
    let hashedBody;
    if (type === 'Node')
        hashedBody = constructNodeBody(body);
    else if (type === 'Edge')
        hashedBody = constructEdgeBody(body);
    else if (type === 'Receipt')
        hashedBody = constructReceiptBody(body);
    else if (type === 'Request')
        hashedBody = constructRequestBody(body);
    validateForCanonicalization(hashedBody);
    const jcsString = (0, json_canonicalize_1.canonicalize)(hashedBody);
    if (jcsString === undefined)
        throw new Error("Canonicalization failed");
    const prefix = exports.DOMAIN_PREFIXES[type];
    const canonicalBytes = Buffer.concat([
        Buffer.from(prefix, 'utf8'),
        Buffer.from(jcsString, 'utf8')
    ]);
    const hash = crypto.createHash('sha256').update(canonicalBytes).digest();
    const digestHex = hash.toString('hex');
    const b58 = bs58_1.default.encode(hash);
    const prefixMap = {
        Node: 'node-',
        Edge: 'edge-',
        Receipt: 'rect-',
        Request: 'reqt-'
    };
    return { canonicalBytes, textualId: `${prefixMap[type]}${b58}`, digestHex };
}
function computeArtifactAddress(rawBytes) {
    const hash = crypto.createHash('sha256').update(rawBytes).digest();
    const digestHex = hash.toString('hex');
    return { digestHex, textualId: digestHex };
}
