import { getPathValue } from './condition-evaluator'; // Assuming getPathValue is exported

/**
 * Resolves placeholders in a payload object or string against various contexts.
 * Placeholders: {{contextName.path.to.value}}
 * Supported contexts: 'item', 'form', 'customData'
 */
export function resolvePayload(
  payloadTemplate: Record<string, any> | string | undefined,
  contexts: {
    item?: any;
    form?: any;
    customData?: any;
  }
): any {
  if (payloadTemplate === undefined) return undefined;

  if (typeof payloadTemplate === 'string') {
    return resolveString(payloadTemplate, contexts);
  }

  if (typeof payloadTemplate === 'object' && payloadTemplate !== null) {
    const resolvedObject: Record<string, any> = {};
    for (const key in payloadTemplate) {
      if (Object.prototype.hasOwnProperty.call(payloadTemplate, key)) {
        resolvedObject[key] = resolvePayload(payloadTemplate[key], contexts);
      }
    }
    return resolvedObject;
  }

  return payloadTemplate; // Return as is if not string or object (e.g. number, boolean)
}

function resolveString(str: string, contexts: { item?: any; form?: any; customData?: any; }) {
  return str.replace(/{{(.*?)}}/g, (match, placeholder) => {
    const parts = placeholder.trim().split('.');
    if (parts.length < 2) return match; // Invalid placeholder

    const contextName = parts[0];
    const path = parts.slice(1).join('.');

    let contextObject: any;
    if (contextName === 'item' && contexts.item) {
      contextObject = contexts.item;
    } else if (contextName === 'form' && contexts.form) {
      contextObject = contexts.form;
    } else if (contextName === 'customData' && contexts.customData) {
      contextObject = contexts.customData;
    } else {
      return match; // Unknown context
    }

    const value = getPathValue(contextObject, path);
    return value !== undefined ? String(value) : match; // Keep placeholder if value not found
  });
}
