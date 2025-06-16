import { useState, useCallback } from 'react';

export interface TemplateConfig {
  templateType: string;
  title: string;
  description?: string;
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  fullScreen?: boolean;
  closeButtonText?: string;
  actionButtonText?: string;
  [key: string]: any;
}

export interface UseTemplateReturn {
  templates: TemplateConfig[];
  isLoading: boolean;
  error: string | null;
  generateTemplate: (params: {
    templateType: string;
    title: string;
    description?: string;
    config?: Record<string, any>;
    useCase?: string;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
  }) => Promise<TemplateConfig | null>;
  clearTemplates: () => void;
  removeTemplate: (index: number) => void;
}

export function useTemplates(): UseTemplateReturn {
  const [templates, setTemplates] = useState<TemplateConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTemplate = useCallback(async (params: {
    templateType: string;
    title: string;
    description?: string;
    config?: Record<string, any>;
    useCase?: string;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
  }): Promise<TemplateConfig | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate a ${params.templateType} template with the title "${params.title}"${params.description ? ` and description "${params.description}"` : ''}${params.useCase ? ` for the use case: ${params.useCase}` : ''}.`
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();
      
      // Extract template from tool results
      if (data.toolResults && data.toolResults.length > 0) {
        const toolResult = data.toolResults[0];
        if (toolResult.result?.success && toolResult.result?.template) {
          const newTemplate = toolResult.result.template;
          setTemplates(prev => [...prev, newTemplate]);
          return newTemplate;
        }
      }

      throw new Error('No template generated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearTemplates = useCallback(() => {
    setTemplates([]);
    setError(null);
  }, []);

  const removeTemplate = useCallback((index: number) => {
    setTemplates(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    templates,
    isLoading,
    error,
    generateTemplate,
    clearTemplates,
    removeTemplate,
  };
}
