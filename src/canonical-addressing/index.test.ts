import { validateForCanonicalization, computeSemanticAddress, parseSemanticAddress } from './index';

describe('Pre-Canonicalization Validation', () => {
  it('rejects undefined', () => {
    expect(() => validateForCanonicalization({ a: undefined })).toThrow('UNDEFINED_VALUE');
  });

  it('rejects sparse arrays', () => {
    const arr = [1];
    arr[2] = 3;
    expect(() => validateForCanonicalization({ arr })).toThrow('SPARSE_ARRAY');
  });

  it('rejects NaN and Infinity', () => {
    expect(() => validateForCanonicalization({ a: NaN })).toThrow('NON_FINITE_NUMBER');
    expect(() => validateForCanonicalization({ a: Infinity })).toThrow('NON_FINITE_NUMBER');
  });

  it('rejects unsupported native types', () => {
    expect(() => validateForCanonicalization({ a: new Date() })).toThrow('UNSUPPORTED_TYPE');
    expect(() => validateForCanonicalization({ a: new Map() })).toThrow('UNSUPPORTED_TYPE');
    expect(() => validateForCanonicalization({ a: Symbol('a') })).toThrow('UNSUPPORTED_TYPE');
    expect(() => validateForCanonicalization({ a: () => {} })).toThrow('UNSUPPORTED_TYPE');
    expect(() => validateForCanonicalization({ a: BigInt(1) })).toThrow('UNSUPPORTED_TYPE');
  });

  it('rejects lone surrogates', () => {
    expect(() => validateForCanonicalization({ a: '\uD800' })).toThrow('LONE_SURROGATE');
  });

  it('rejects cyclic objects', () => {
    const a: any = {};
    a.b = a;
    expect(() => validateForCanonicalization(a)).toThrow('CYCLIC_VALUE');
  });
});

describe('Address Parsing', () => {
  it('parses valid addresses', () => {
    const res = parseSemanticAddress('node-2rmGaE6GXit2ZBpGNsvpreuSy3G8SPLCr6oPPgtWAcnW');
    expect(res.prefix).toBe('node');
    expect(res.digest.length).toBe(32);
  });

  it('rejects invalid prefixes', () => {
    expect(() => parseSemanticAddress('fake-2rmGaE6GXit2ZBpGNsvpreuSy3G8SPLCr6oPPgtWAcnW')).toThrow('INVALID_ADDRESS_PREFIX');
    expect(() => parseSemanticAddress('node-2rmGaE6GXit2ZBpGNsvpreuSy3G8SPLCr6oPPgtWAcnW', 'Edge')).toThrow('INVALID_ADDRESS_PREFIX');
  });

  it('rejects invalid alphabets', () => {
    expect(() => parseSemanticAddress('node-0OIl2rmGaE')).toThrow('INVALID_ADDRESS_ALPHABET');
  });

  it('rejects invalid length', () => {
    expect(() => parseSemanticAddress('node-2rmGaE6')).toThrow('INVALID_ADDRESS_LENGTH');
  });
});
