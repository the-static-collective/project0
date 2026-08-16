import { REASON_CODES, type ReasonCode } from "./reason-codes.js";
import { addressReceipt, validateReceipt } from "./validate.js";
import type { CanonicalReceipt } from "./types.js";

export type ReceiptRecord = {
  receiptRef: string;
  receipt: CanonicalReceipt;
};

export type AppendReceiptResult =
  | { status: "appended"; receiptRef: string }
  | { status: "idempotent"; receiptRef: string }
  | { status: "refused"; reasonCodes: ReasonCode[] };

type StoredReceipt = ReceiptRecord & { canonicalBytes: Buffer };

function cloneReceipt(receipt: CanonicalReceipt): CanonicalReceipt {
  return structuredClone(receipt);
}

export class ReceiptGraph {
  private readonly receipts = new Map<string, StoredReceipt>();

  append(value: unknown): AppendReceiptResult {
    const validation = validateReceipt(value);
    if (validation.status === "invalid") return { status: "refused", reasonCodes: validation.reasonCodes };

    const receipt = value as CanonicalReceipt;
    for (const parentRef of receipt.previousReceiptRefs) {
      if (!this.receipts.has(parentRef)) {
        return { status: "refused", reasonCodes: [REASON_CODES.RECEIPT_PARENT_MISSING] };
      }
    }

    const addressed = addressReceipt(receipt);
    const existing = this.receipts.get(addressed.address);
    if (existing) {
      if (!existing.canonicalBytes.equals(addressed.canonicalBytes)) {
        return { status: "refused", reasonCodes: [REASON_CODES.RECEIPT_IDENTITY_CONFLICT] };
      }
      return { status: "idempotent", receiptRef: addressed.address };
    }

    this.receipts.set(addressed.address, {
      receiptRef: addressed.address,
      receipt: cloneReceipt(receipt),
      canonicalBytes: Buffer.from(addressed.canonicalBytes),
    });
    return { status: "appended", receiptRef: addressed.address };
  }

  has(receiptRef: string): boolean {
    return this.receipts.has(receiptRef);
  }

  get(receiptRef: string): CanonicalReceipt | undefined {
    const record = this.receipts.get(receiptRef);
    return record ? cloneReceipt(record.receipt) : undefined;
  }

  all(): ReceiptRecord[] {
    return [...this.receipts.values()]
      .sort((a, b) => a.receiptRef.localeCompare(b.receiptRef))
      .map(({ receiptRef, receipt }) => ({ receiptRef, receipt: cloneReceipt(receipt) }));
  }

  childrenOf(receiptRef: string): ReceiptRecord[] {
    return [...this.receipts.values()]
      .filter((item) => item.receipt.previousReceiptRefs.includes(receiptRef))
      .sort((a, b) => a.receiptRef.localeCompare(b.receiptRef))
      .map(({ receiptRef: childRef, receipt }) => ({ receiptRef: childRef, receipt: cloneReceipt(receipt) }));
  }

  countConsumptions(grantRef: string): number {
    let count = 0;
    for (const record of this.receipts.values()) {
      if (record.receipt.receiptType === "LeaseConsumption" && record.receipt.authorityRef === grantRef) count += 1;
    }
    return count;
  }
}
