/**
 * React Hook for MCP Integration
 * 
 * This hook provides a clean interface for React components to interact
 * with the MCP server through the API endpoints.
 */

import { useState, useEffect, useCallback } from 'react';

// Types for MCP operations
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: any[];
}

export interface UITemplate {
  id: string;
  type: string;
  title: string;
  description: string;
  data: any;
  metadata?: {
    category?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    tags?: string[];
  };
}

export interface MCPCapabilities {
  tools: MCPTool[];
  resources: MCPResource[];
  prompts: MCPPrompt[];
  summary: {
    toolCount: number;
    resourceCount: number;
    promptCount: number;
  };
}

export interface MCPStatus {
  connected: boolean;
  healthy: boolean;
  error?: string;
  lastChecked?: Date;
}

export interface UseMCPReturn {
  // State
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  capabilities: MCPCapabilities | null;
  status: MCPStatus;

  // Template operations
  generateTemplate: (templateType: string, requirements: any, userInput?: string) => Promise<UITemplate | null>;
  getTemplateSuggestions: (userInput: string) => Promise<string[]>;

  // Tool operations
  callTool: (toolName: string, arguments_: any) => Promise<any>;
  listTools: () => Promise<MCPTool[]>;

  // Connection management
  checkHealth: () => Promise<boolean>;
  refreshCapabilities: () => Promise<void>;
  
  // Utility
  clearError: () => void;
}

/**
 * Custom hook for MCP integration
 */
export function useMCP(): UseMCPReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capabilities, setCapabilities] = useState<MCPCapabilities | null>(null);
  const [status, setStatus] = useState<MCPStatus>({
    connected: false,
    healthy: false
  });

  /**
   * Make API call to MCP endpoint
   */
  const makeAPICall = useCallback(async (body: any) => {
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'MCP API call failed');
    }

    return data.data;
  }, []);

  /**
   * Generate a UI template
   */
  const generateTemplate = useCallback(async (
    templateType: string, 
    requirements: any, 
    userInput?: string
  ): Promise<UITemplate | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await makeAPICall({
        action: 'generate',
        templateType,
        requirements,
        userInput
      });

      return result as UITemplate;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Template generation failed';
      setError(errorMessage);
      console.error('Template generation error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [makeAPICall]);

  /**
   * Get template suggestions based on user input
   */
  const getTemplateSuggestions = useCallback(async (userInput: string): Promise<string[]> => {
    try {
      setError(null);

      const result = await makeAPICall({
        action: 'getSuggestions',
        userInput
      });

      return result.suggestions || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get suggestions';
      setError(errorMessage);
      console.error('Get suggestions error:', err);
      return [];
    }
  }, [makeAPICall]);

  /**
   * Call a specific MCP tool
   */
  const callTool = useCallback(async (toolName: string, arguments_: any): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await makeAPICall({
        action: 'callTool',
        toolName,
        arguments: arguments_
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Tool call failed';
      setError(errorMessage);
      console.error('Tool call error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [makeAPICall]);

  /**
   * List available tools
   */
  const listTools = useCallback(async (): Promise<MCPTool[]> => {
    try {
      setError(null);

      const result = await makeAPICall({
        action: 'listTools'
      });

      return result.tools || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list tools';
      setError(errorMessage);
      console.error('List tools error:', err);
      return [];
    }
  }, [makeAPICall]);

  /**
   * Check MCP server health
   */
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      const result = await makeAPICall({
        action: 'health'
      });

      const isHealthy = result.status === 'healthy';
      const isConnected = result.connected;

      setStatus({
        connected: isConnected,
        healthy: isHealthy,
        lastChecked: new Date()
      });

      setIsConnected(isConnected && isHealthy);

      return isHealthy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      setStatus({
        connected: false,
        healthy: false,
        error: errorMessage,
        lastChecked: new Date()
      });
      setIsConnected(false);
      console.error('Health check error:', err);
      return false;
    }
  }, [makeAPICall]);

  /**
   * Refresh capabilities from MCP server
   */
  const refreshCapabilities = useCallback(async (): Promise<void> => {
    try {
      setError(null);

      const result = await makeAPICall({
        action: 'listTools'
      });

      setCapabilities(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh capabilities';
      setError(errorMessage);
      console.error('Refresh capabilities error:', err);
    }
  }, [makeAPICall]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initialize MCP connection and load capabilities on mount
   */
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Check health first
        const isHealthy = await checkHealth();
        
        if (isHealthy && mounted) {
          // Load capabilities if healthy
          await refreshCapabilities();
        }
      } catch (err) {
        console.error('MCP initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize MCP');
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [checkHealth, refreshCapabilities]);

  /**
   * Periodic health checks
   */
  useEffect(() => {
    const interval = setInterval(() => {
      checkHealth().catch(console.error);
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    // State
    isConnected,
    isLoading,
    error,
    capabilities,
    status,

    // Template operations
    generateTemplate,
    getTemplateSuggestions,

    // Tool operations
    callTool,
    listTools,

    // Connection management
    checkHealth,
    refreshCapabilities,

    // Utility
    clearError,
  };
}

/**
 * Hook for template generation with caching
 */
export function useTemplateGeneration() {
  const mcp = useMCP();
  const [templateCache, setTemplateCache] = useState<Map<string, UITemplate>>(new Map());

  const generateCachedTemplate = useCallback(async (
    templateType: string,
    requirements: any,
    userInput?: string
  ): Promise<UITemplate | null> => {
    // Create cache key
    const cacheKey = `${templateType}-${JSON.stringify(requirements)}-${userInput || ''}`;
    
    // Check cache first
    if (templateCache.has(cacheKey)) {
      return templateCache.get(cacheKey)!;
    }

    // Generate new template
    const template = await mcp.generateTemplate(templateType, requirements, userInput);
    
    if (template) {
      // Cache the result
      setTemplateCache(prev => new Map(prev).set(cacheKey, template));
    }

    return template;
  }, [mcp, templateCache]);

  const clearTemplateCache = useCallback(() => {
    setTemplateCache(new Map());
  }, []);

  return {
    ...mcp,
    generateTemplate: generateCachedTemplate,
    clearTemplateCache,
    cacheSize: templateCache.size
  };
}