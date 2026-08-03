import { createHash } from "node:crypto";

export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type ContentAddress = Brand<string, "ContentAddress">;
export type ArtifactAddress = Brand<string, "ArtifactAddress">;
export type TrailAddress = Brand<string, "TrailAddress">;
export type ViewAddress = Brand<string, "ViewAddress">;
export type QuestionAddress = Brand<string, "QuestionAddress">;
export type HistoricalAddress = ArtifactAddress | QuestionAddress;

export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries
    .map(([key, item]) => `${JSON.stringify(key)}:${canonicalize(item)}`)
    .join(",")}}`;
}

function digest(namespace: string, value: unknown): string {
  return `${namespace}:sha256:${createHash("sha256")
    .update(canonicalize(value))
    .digest("hex")}`;
}

export const address = {
  content(bytes: Uint8Array | string): ContentAddress {
    const normalized = Buffer.from(bytes);
    return `content:sha256:${createHash("sha256").update(normalized).digest("hex")}` as ContentAddress;
  },
  artifact(value: unknown): ArtifactAddress {
    return digest("artifact", value) as ArtifactAddress;
  },
  trail(value: unknown): TrailAddress {
    return digest("trail", value) as TrailAddress;
  },
  view(value: unknown): ViewAddress {
    return digest("view", value) as ViewAddress;
  },
  question(value: unknown): QuestionAddress {
    return digest("artifact", value) as QuestionAddress;
  },
};
