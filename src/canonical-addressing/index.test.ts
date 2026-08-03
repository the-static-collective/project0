import { computeHash, computeTextualId, DOMAIN_PREFIXES } from './index';

describe('Canonical Addressing', () => {
  it('should ignore key ordering', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 2, a: 1 };
    expect(computeHash(obj1, DOMAIN_PREFIXES.Node)).toEqual(computeHash(obj2, DOMAIN_PREFIXES.Node));
  });

  it('should treat null and omitted differently', () => {
    const obj1 = { a: 1, b: null };
    const obj2 = { a: 1 };
    expect(computeHash(obj1, DOMAIN_PREFIXES.Node)).not.toEqual(computeHash(obj2, DOMAIN_PREFIXES.Node));
  });

  it('should compute textual IDs correctly', () => {
    const obj = { kind: 'claim', body: 'hello' };
    const id = computeTextualId(obj, 'Node');
    expect(id.startsWith('node-')).toBe(true);
  });

  it('should remove self-reference fields', () => {
    const objWithId = { id: 'node-123', kind: 'claim', body: 'test' };
    const objWithoutId = { kind: 'claim', body: 'test' };
    expect(computeHash(objWithId, DOMAIN_PREFIXES.Node)).toEqual(computeHash(objWithoutId, DOMAIN_PREFIXES.Node));
  });
});
