import type { Refkey } from "@alloy-js/core";

export function normalizeRefkeys(refkey?: Refkey | Refkey[]): Refkey[] {
  if (!refkey) {
    return [];
  }

  return Array.isArray(refkey) ? refkey : [refkey];
}
