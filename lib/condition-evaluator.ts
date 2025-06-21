/**
 * Evaluates a simple condition string against a data context.
 * Supports:
 * - "context.property === 'value'"
 * - "context.property === true"
 * - "context.property === false"
 * - "context.propertyExists" (checks if context.property is not undefined)
 * - "context.propertyNotExists" (checks if context.property is undefined)
 * - "context.property === 123" (numeric comparison)
 *
 * VERY IMPORTANT: This is a basic evaluator for trusted condition strings.
 * It is NOT a full-fledged, secure expression parser.
 * Avoid using with untrusted condition strings due to potential for manipulation
 * if complexity is significantly increased without proper sandboxing.
 */
export function evaluateCondition(conditionString: string, context: any): boolean {
  if (!conditionString) return true; // No condition means true
  if (!context) return false; // No context means false (unless condition is to check for non-existence)

  const equalityMatch = conditionString.match(/^([\w.-]+)\s*===\s*(['"]?)(.+?)['"]?$/);
  if (equalityMatch) {
    const path = equalityMatch[1];
    const expectedValueString = equalityMatch[3];
    let actualValue = getPathValue(context, path);

    // Try to infer type for comparison
    if (typeof actualValue === 'boolean') {
      return actualValue === (expectedValueString.toLowerCase() === 'true');
    } else if (typeof actualValue === 'number') {
      return actualValue === parseFloat(expectedValueString);
    } else if (actualValue === undefined && expectedValueString === 'undefined') {
        return true;
    }
      else if (typeof actualValue === 'string') {
        return actualValue === expectedValueString;
    }
    // Default to string comparison if types are mixed or unclear and actualValue is not undefined
    return actualValue !== undefined && String(actualValue) === expectedValueString;
  }

  const existsMatch = conditionString.match(/^([\w.-]+)Exists$/);
  if (existsMatch) {
    const path = existsMatch[1];
    return getPathValue(context, path) !== undefined;
  }

  const notExistsMatch = conditionString.match(/^([\w.-]+)NotExists$/);
  if (notExistsMatch) {
    const path = notExistsMatch[1];
    return getPathValue(context, path) === undefined;
  }

  console.warn(`Unsupported condition string format: ${conditionString}`);
  return false; // Default to false for unsupported conditions
}

// Helper to get a value from a context object using a dot-separated path
export function getPathValue(obj: any, path: string): any {
  if (!path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}
