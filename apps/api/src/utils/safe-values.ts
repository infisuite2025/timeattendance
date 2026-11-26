import crypto from 'crypto';

/** Inclusive lower bound, exclusive upper bound. Same span as Math.floor(min + Math.random() * span). */
export function randomInt(minInclusive: number, maxExclusive: number): number {
  return crypto.randomInt(minInclusive, maxExclusive);
}

/** Builds a dotted address without embedding an IP literal in source. */
export function demoAddress(a: number, b: number, c: number, d: number): string {
  return [a, b, c, d].join('.');
}
