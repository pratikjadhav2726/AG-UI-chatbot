// lib/__tests__/payload-resolver.test.ts (Illustrative content)
import { resolvePayload } from '../payload-resolver'; // Adjust path

describe('resolvePayload', () => {
  const contexts = {
    item: { id: 'item123', name: 'Test Item', price: 19.99, details: { color: 'Red' } },
    form: { quantity: 2, email: 'test@example.com', shipping: { address: '123 Main St' } },
    customData: { userId: 'userABC', theme: 'dark' }
  };

  it('should resolve simple top-level placeholders', () => {
    const template = { productId: "{{item.id}}", user: "{{customData.userId}}" };
    expect(resolvePayload(template, contexts)).toEqual({ productId: "item123", user: "userABC" });
  });

  it('should resolve nested placeholders', () => {
    const template = { itemColor: "{{item.details.color}}", shippingTo: "{{form.shipping.address}}" };
    expect(resolvePayload(template, contexts)).toEqual({ itemColor: "Red", shippingTo: "123 Main St" });
  });

  it('should handle mixed literal values and placeholders', () => {
    const template = {
      staticKey: "Static Value",
      dynamicPrice: "{{item.price}}",
      orderSummary: "User {{customData.userId}} ordered {{form.quantity}} of {{item.name}}."
    };
    expect(resolvePayload(template, contexts)).toEqual({
      staticKey: "Static Value",
      dynamicPrice: "19.99",
      orderSummary: "User userABC ordered 2 of Test Item."
    });
  });

  it('should resolve placeholders in a string directly', () => {
    const templateString = "Item: {{item.name}}, Price: {{item.price}}";
    expect(resolvePayload(templateString, contexts)).toBe("Item: Test Item, Price: 19.99");
  });

  it('should keep placeholder if path is not found', () => {
    const template = { itemId: "{{item.id}}", missing: "{{item.nonExistent}}" };
    expect(resolvePayload(template, contexts)).toEqual({ itemId: "item123", missing: "{{item.nonExistent}}" });
  });

  it('should keep placeholder if context is not found', () => {
    const template = { data: "{{unknownContext.someField}}" };
    expect(resolvePayload(template, contexts)).toEqual({ data: "{{unknownContext.someField}}" });
  });

  it('should handle undefined payload template', () => {
    expect(resolvePayload(undefined, contexts)).toBeUndefined();
  });

  it('should handle null or non-object/non-string payload template by returning it as is', () => {
    expect(resolvePayload(null, contexts)).toBeNull();
    expect(resolvePayload(123, contexts)).toBe(123);
    expect(resolvePayload(true, contexts)).toBe(true);
  });

  it('should resolve nested payload objects', () => {
    const template = {
      level1: {
        item_id: "{{item.id}}",
        level2: {
          form_email: "{{form.email}}"
        }
      }
    };
    expect(resolvePayload(template, contexts)).toEqual({
      level1: {
        item_id: "item123",
        level2: {
          form_email: "test@example.com"
        }
      }
    });
  });
});
