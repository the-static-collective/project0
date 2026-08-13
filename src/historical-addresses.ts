import { createHash } from "node:crypto";
import { canonicalizeDomainValue } from "./canonical-addressing/index.js";

export type Brand<T, Name extends string> = T & { readonly __brand: Name };
export type ContentAddress = Brand<string, "ContentAddress">;
export type ArtifactAddress = Brand<string, "ArtifactAddress">;
export type ResidueAddress = Brand<string, "ResidueAddress">;
export type TrailAddress = Brand<string, "TrailAddress">;
export type ViewAddress = Brand<string, "ViewAddress">;
export type QuestionAddress = Brand<string, "QuestionAddress">;
export type HistoricalAddress = ArtifactAddress | QuestionAddress;

function structured<Name extends string>(kind: Name, value: unknown): Brand<string, Name> {
  const { digestHex } = canonicalizeDomainValue(`Project0-${kind}-v1|`, value);
  return `${kind.toLowerCase()}:sha256:${digestHex}` as Brand<string, Name>;
}

export const address = {
  content(bytes: Uint8Array | string): ContentAddress {
    return `content:sha256:${createHash("sha256").update(Buffer.from(bytes)).digest("hex")}` as ContentAddress;
  },
  artifact: (value: unknown) => structured("ArtifactAddress", value),
  residue: (value: unknown) => structured("ResidueAddress", value),
  trail: (value: unknown) => structured("TrailAddress", value),
  view: (value: unknown) => structured("ViewAddress", value),
  question: (value: unknown) => structured("QuestionAddress", value),
};
