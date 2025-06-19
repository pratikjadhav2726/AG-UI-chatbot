import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Adjust imports as needed

interface AnalyticsTemplateProps {
  config: any; // Replace 'any' with a more specific type if available
  onDataChange?: (data: any) => void; // Optional callback
}

export const AnalyticsTemplate: React.FC<AnalyticsTemplateProps> = ({ config, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title || 'Analytics Template'}</CardTitle>
        {config.description && <CardDescription>{config.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p>Analytics specific content will go here.</p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};
