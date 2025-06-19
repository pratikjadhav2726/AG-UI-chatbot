// lib/__tests__/condition-evaluator.test.ts (Illustrative content)
import { evaluateCondition, getPathValue } from '../condition-evaluator'; // Adjust path as needed

describe('getPathValue', () => {
  const testContext = {
    user: { name: 'Alice', role: 'admin', details: { age: 30 } },
    settings: { theme: 'dark' },
    empty: null,
    items: [{id:1}, {id:2}]
  };

  it('should get top-level values', () => {
    expect(getPathValue(testContext, 'settings.theme')).toBe('dark');
  });
  it('should get nested values', () => {
    expect(getPathValue(testContext, 'user.details.age')).toBe(30);
  });
  it('should return undefined for non-existent paths', () => {
    expect(getPathValue(testContext, 'user.nonExistent')).toBeUndefined();
    expect(getPathValue(testContext, 'foo.bar')).toBeUndefined();
  });
  it('should return undefined for null/undefined context', () => {
    expect(getPathValue(null, 'user.name')).toBeUndefined();
    expect(getPathValue(undefined, 'user.name')).toBeUndefined();
  });
   it('should return object/array if path points to it', () => {
    expect(getPathValue(testContext, 'user.details')).toEqual({ age: 30 });
    expect(getPathValue(testContext, 'items')).toEqual([{id:1}, {id:2}]);
  });
  it('should handle path to null value', () => {
    expect(getPathValue(testContext, 'empty')).toBeNull();
  });
});

describe('evaluateCondition', () => {
  const dataContext = {
    user: { name: 'Bob', role: 'editor', id: 123, active: true, score: 100 },
    product: { status: 'published', price: 99.99 },
    customData: { showAdminFeatures: false, version: 2 },
    form: { email: 'bob@example.com', quantity: 0 }
  };

  // True conditions
  it('evaluates "path === string" correctly (true)', () => {
    expect(evaluateCondition("user.role === 'editor'", dataContext)).toBe(true);
    expect(evaluateCondition("product.status === 'published'", dataContext)).toBe(true);
  });
  it('evaluates "path === boolean" correctly (true)', () => {
    expect(evaluateCondition("user.active === true", dataContext)).toBe(true);
    expect(evaluateCondition("customData.showAdminFeatures === false", dataContext)).toBe(true);
  });
  it('evaluates "path === number" correctly (true)', () => {
    expect(evaluateCondition("user.id === 123", dataContext)).toBe(true);
    expect(evaluateCondition("product.price === 99.99", dataContext)).toBe(true);
    expect(evaluateCondition("form.quantity === 0", dataContext)).toBe(true);
  });
  it('evaluates "pathExists" correctly (true)', () => {
    expect(evaluateCondition("user.nameExists", dataContext)).toBe(true);
    expect(evaluateCondition("product.statusExists", dataContext)).toBe(true);
  });
  it('evaluates "pathNotExists" correctly (true)', () => {
    expect(evaluateCondition("user.nonExistentPropertyNotExists", dataContext)).toBe(true);
  });
   it('evaluates "path === undefined" correctly (true for non-existent path)', () => {
    expect(evaluateCondition("user.nonExistent === undefined", dataContext)).toBe(true);
  });

  // False conditions
  it('evaluates "path === string" correctly (false)', () => {
    expect(evaluateCondition("user.role === 'admin'", dataContext)).toBe(false);
  });
  it('evaluates "path === boolean" correctly (false)', () => {
    expect(evaluateCondition("user.active === false", dataContext)).toBe(false);
  });
  it('evaluates "path === number" correctly (false)', () => {
    expect(evaluateCondition("user.id === 456", dataContext)).toBe(false);
  });
  it('evaluates "pathExists" correctly (false for non-existent)', () => {
    expect(evaluateCondition("user.nonExistentPropertyExists", dataContext)).toBe(false);
  });
  it('evaluates "pathNotExists" correctly (false for existing)', () => {
    expect(evaluateCondition("user.nameNotExists", dataContext)).toBe(false);
  });
  it('evaluates "path === undefined" correctly (false for existing path)', () => {
    expect(evaluateCondition("user.name === undefined", dataContext)).toBe(false);
  });

  // Edge cases
  it('returns true for empty condition string', () => {
    expect(evaluateCondition("", dataContext)).toBe(true);
  });
  it('returns false for null/undefined context (unless checking NotExists)', () => {
    expect(evaluateCondition("user.role === 'editor'", null)).toBe(false);
    expect(evaluateCondition("user.roleExists", undefined)).toBe(false);
    expect(evaluateCondition("user.roleNotExists", null)).toBe(true);
  });
  it('returns false for malformed condition strings', () => {
    expect(evaluateCondition("user.role = 'editor'", dataContext)).toBe(false); // Single =
    expect(evaluateCondition("user.role === editor", dataContext)).toBe(false); // Unquoted string
  });
});
