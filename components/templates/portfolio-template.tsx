import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PortfolioTemplateProps {
  config: any;
  onDataChange?: (data: any) => void;
}

export const PortfolioTemplate: React.FC<PortfolioTemplateProps> = ({ config, onDataChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title || 'Portfolio Template'}</CardTitle>
        {config.description && <CardDescription>{config.description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p>Portfolio specific content will go here.</p>
        <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
};
