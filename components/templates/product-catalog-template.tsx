"use client";

import React from 'react';
import { getPathValue, evaluateCondition } from '@/lib/condition-evaluator';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card"; // Removed unused imports
import type { ActionSchema } from '@/lib/template-schemas'; // Added ActionSchema import
import { resolvePayload } from '@/lib/payload-resolver'; // Added resolvePayload import

interface ProductCatalogTemplateProps {
  config: any; // Replace with ProductCatalogSchema if imported and available
  onDataChange: (data: any) => void; // For actions
}

// Helper to render a single field from the itemSchema
const renderItemField = (field: any, item: any, itemIndex: number, config: any, onDataChange: (data: any) => void) => { // Added config
  const fieldValue = getPathValue(item, field.source.replace(/^item\./, ''));
  const fieldCondition = field.condition ? field.condition.replace(/^item\./, '') : null;

  if (fieldCondition && !evaluateCondition(fieldCondition, item)) {
    return null;
  }

  if (fieldValue === undefined && field.type !== 'button') return null; // Don't render if data is missing, unless it's a button

  switch (field.type) {
    case "image":
      const altText = field.altSource ? getPathValue(item, field.altSource.replace(/^item\./, '')) : field.source;
      return (
        <img
          key={`${field.id}-${itemIndex}`}
          src={fieldValue}
          alt={altText || 'Product Image'}
          className="w-full h-48 object-cover mb-2 rounded-md" // Basic styling
        />
      );
    case "text":
      let textClass = "text-sm";
      if (field.style === "title") textClass = "text-lg font-semibold";
      if (field.style === "description") textClass = "text-xs text-gray-600";
      if (field.style === "price") textClass = "text-md font-bold text-green-600";
      return (
        <p key={`${field.id}-${itemIndex}`} className={textClass}>
          {field.prefix}{fieldValue}{field.suffix}
        </p>
      );
    case "badge":
      return (
        <Badge key={`${field.id}-${itemIndex}`} variant="outline" className="mr-1 mb-1">{fieldValue}</Badge>
      );
    case "button":
      const actionDef = field.actionDefinition as ActionSchema; // Cast
      if (!actionDef) return <Button disabled>{field.label || "N/A"}</Button>;

      return (
        <Button
          key={`${field.id}-${itemIndex}`}
          size="sm"
          className="mt-2" // Basic styling
          onClick={() => {
            if (actionDef.confirmationMessage) {
              if (!window.confirm(actionDef.confirmationMessage)) return;
            }
            const resolvedPayload = resolvePayload(actionDef.payload || actionDef.arguments, { item: item, customData: config.customData });
            onDataChange({ // onDataChange is the onInteraction prop from DynamicTemplate
              type: actionDef.type,
              actionId: actionDef.id,
              // Pass specific fields
              ...(actionDef.type === 'MCP_TOOL_CALL' && { toolName: actionDef.toolName, arguments: resolvedPayload }),
              ...(actionDef.type === 'CUSTOM_EVENT' && { eventName: actionDef.eventName, payload: resolvedPayload }),
              ...(actionDef.type === 'NAVIGATE' && { navigateTo: actionDef.navigateTo }),
              ...(actionDef.type === 'API_CALL' && { apiUrl: actionDef.apiUrl, apiMethod: actionDef.apiMethod, payload: resolvedPayload }),
              // Include item context if useful for the handler
              itemContext: { id: item.id, data: item }
            });
          }}
        >
          {field.label || actionDef.label || "Action"}
        </Button>
      );
    default:
      return <p key={`${field.id}-${itemIndex}`} className="text-xs text-red-500">Unknown field type: {field.type}</p>;
  }
};

export const ProductCatalogTemplate: React.FC<ProductCatalogTemplateProps> = ({ config, onDataChange }) => {
  const { layout = "grid", columns = 3, itemDataSource, itemSchema } = config; // Removed unused customData, title, description

  const items = getPathValue(config, itemDataSource) || []; // Use config as context for itemDataSource

  if (!itemSchema || !itemSchema.fields || !items) {
    return <div>Error: Item schema or data source is not properly configured.</div>;
  }

  const gridColsClass = layout === 'grid' ? `md:grid-cols-${columns}` : '';

  return (
    <div>
      {/* Filters and sorting controls could be added here, using config.categories and config.sorting */}
      <div className={`grid gap-4 ${layout === 'grid' ? `grid-cols-1 sm:grid-cols-2 ${gridColsClass}` : 'space-y-4'}`}>
        {items.map((item: any, index: number) => (
          <Card key={item.id || index} className="overflow-hidden">
            <CardContent className="p-4">
              {itemSchema.fields.map((field: any) => renderItemField(field, item, index, config, onDataChange))}
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 && <p>No products to display.</p>}
    </div>
  );
};
