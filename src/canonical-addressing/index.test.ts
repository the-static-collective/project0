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

  it('rejects unsupported native types and custom prototypes', () => {
    class CustomClass { a = 1; }
    expect(() => validateForCanonicalization({ a: new Date() })).toThrow('CUSTOM_PROTOTYPE');
    expect(() => validateForCanonicalization({ a: new Map() })).toThrow('CUSTOM_PROTOTYPE');
    expect(() => validateForCanonicalization({ a: new CustomClass() })).toThrow('CUSTOM_PROTOTYPE');
    // Object.create(null) is explicitly null prototype, which is allowed by `proto !== Object.prototype && proto !== Array.prototype && proto !== null`
    // Wait, the test specifically requested Object.create(null) to be tested. It is technically a plain dictionary, so the user might want it rejected, OR the user wants to ensure it's tested. If the user expects it to pass or fail? "Add tests for: ... Object.create(null)". In my logic, proto === null passes `proto !== null`. If I am to reject it, I would just change my logic. But I think it is fine to accept it if `null` proto is valid for JCS. Ah, the user instruction was "Object.getPrototypeOf(value) must be Object.prototype or null". So it should pass.
    expect(() => validateForCanonicalization({ a: Symbol('a') })).toThrow('UNSUPPORTED_TYPE');
    expect(() => validateForCanonicalization({ a: () => {} })).toThrow('UNSUPPORTED_TYPE');
    expect(() => validateForCanonicalization({ a: BigInt(1) })).toThrow('UNSUPPORTED_TYPE');
  });

  it('accepts Object.create(null)', () => {
    const obj = Object.create(null);
    obj.a = 1;
    expect(() => validateForCanonicalization(obj)).not.toThrow();
  });

  it('rejects lone surrogates', () => {
    expect(() => validateForCanonicalization({ a: '\uD800' })).toThrow('LONE_SURROGATE');
  });

  it('rejects cyclic objects', () => {
    const a: any = {};
    a.b = a;
    expect(() => validateForCanonicalization(a)).toThrow('CYCLIC_VALUE');
  });

  it('rejects property accessors before evaluating schemas', () => {
    const a: any = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' };
    Object.defineProperty(a, 'kind', {
      get: () => { throw new Error('GETTER_EXECUTED'); },
      enumerable: true
    });
    // This should fail via validateForCanonicalization before the getter fires during constructNodeBody
    expect(() => computeSemanticAddress('Node', a)).toThrow('ACCESSOR_PROPERTY');
  });

  it('rejects non-enumerable properties', () => {
    const a: any = {};
    Object.defineProperty(a, 'x', {
      value: 1,
      enumerable: false
    });
    expect(() => validateForCanonicalization(a)).toThrow('NON_ENUMERABLE_PROPERTY');
  });

  it('rejects symbol-keyed properties', () => {
    const a: any = {};
    a[Symbol('x')] = 1;
    expect(() => validateForCanonicalization(a)).toThrow('SYMBOL_KEYED_PROPERTY');
  });
});

describe('Timestamp Validation', () => {
  it('accepts valid UTC ISO-8601 timestamps', () => {
    const validNode = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' };
    expect(() => computeSemanticAddress('Node', validNode)).not.toThrow();

    const validMillis = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39.123Z', createdBy: 'u1', provenance: [], disclosure: 'public' };
    expect(() => computeSemanticAddress('Node', validMillis)).not.toThrow();
  });

  it('rejects invalid timestamps', () => {
    const tzOffset = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39+00:00', createdBy: 'u1', provenance: [], disclosure: 'public' };
    expect(() => computeSemanticAddress('Node', tzOffset)).toThrow('INVALID_TIMESTAMP');

    const badLengthMillis = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39.12Z', createdBy: 'u1', provenance: [], disclosure: 'public' };
    expect(() => computeSemanticAddress('Node', badLengthMillis)).toThrow('INVALID_TIMESTAMP');

    const wrongType = { kind: 'claim', body: 'a', createdAt: 1234567890, createdBy: 'u1', provenance: [], disclosure: 'public' };
    expect(() => computeSemanticAddress('Node', wrongType)).toThrow('INVALID_TYPE');
  });
});

describe('Type Constraints and Inherited Fields', () => {
  it('rejects wrong required field types', () => {
    const badProvType = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: 'not-array', disclosure: 'public' };
    expect(() => computeSemanticAddress('Node', badProvType)).toThrow('INVALID_TYPE');
  });

  it('rejects inherited required fields', () => {
    // If we use a custom prototype, it gets rejected early via CUSTOM_PROTOTYPE.
    // If we use Object.create(Object.prototype), it's just a normal object, but let's test a plain object where a field is added to Object.prototype.
    (Object.prototype as any).inheritedProp = 'test';
    const badNode: any = { kind: 'claim', body: 'a', createdAt: '2026-08-01T22:17:39Z', createdBy: 'u1', provenance: [], disclosure: 'public' };
    // Let's pretend 'inheritedProp' was the required 'kind' field and we delete 'kind'
    delete badNode.kind;
    (Object.prototype as any).kind = 'claim';

    try {
      expect(() => computeSemanticAddress('Node', badNode)).toThrow('Missing required field: kind');
    } finally {
      delete (Object.prototype as any).inheritedProp;
      delete (Object.prototype as any).kind;
    }
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
