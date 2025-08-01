/**
 * Prompt Manager for MCP Server
 * Handles AI-assisted template design prompts
 */

import type { Prompt, GetPromptResult, PromptMessage } from '../types/mcp.js';
import { getLogger } from '../core/logger.js';

export class PromptManager {
  private prompts = new Map<string, PromptDefinition>();
  private logger = getLogger();

  async initialize(): Promise<void> {
    try {
      this.registerPrompts();
      
      this.logger.info('Prompt Manager initialized', {
        promptCount: this.prompts.size,
        prompts: Array.from(this.prompts.keys())
      });
    } catch (error) {
      this.logger.error('Failed to initialize Prompt Manager', error);
      throw error;
    }
  }

  /**
   * Register all available prompts
   */
  private registerPrompts(): void {
    this.registerPrompt({
      name: 'design_ui_template',
      description: 'AI-assisted template design with requirements analysis',
      arguments: [
        {
          name: 'requirements',
          description: 'User requirements for the UI template',
          required: true
        },
        {
          name: 'context',
          description: 'Additional context about the use case',
          required: false
        },
        {
          name: 'templateType',
          description: 'Preferred template type (optional)',
          required: false
        }
      ],
      handler: this.handleDesignUITemplate.bind(this)
    });

    this.registerPrompt({
      name: 'analyze_template_requirements',
      description: 'Analyze user requirements and suggest optimal template configurations',
      arguments: [
        {
          name: 'description',
          description: 'Description of what the user wants to build',
          required: true
        },
        {
          name: 'industry',
          description: 'Industry or domain context',
          required: false
        },
        {
          name: 'audience',
          description: 'Target audience for the template',
          required: false
        }
      ],
      handler: this.handleAnalyzeRequirements.bind(this)
    });

    this.registerPrompt({
      name: 'optimize_template_performance',
      description: 'Provide suggestions for optimizing template performance',
      arguments: [
        {
          name: 'templateConfig',
          description: 'Current template configuration',
          required: true
        },
        {
          name: 'dataSize',
          description: 'Expected data size (small/medium/large)',
          required: false
        }
      ],
      handler: this.handleOptimizePerformance.bind(this)
    });
  }

  /**
   * Register a new prompt
   */
  registerPrompt(definition: PromptDefinition): void {
    this.prompts.set(definition.name, definition);
    this.logger.debug('Prompt registered', { promptName: definition.name });
  }

  /**
   * List all available prompts
   */
  async listPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values()).map(def => ({
      name: def.name,
      description: def.description,
      arguments: def.arguments
    }));
  }

  /**
   * Get a prompt with the given arguments
   */
  async getPrompt(name: string, args: Record<string, unknown>): Promise<GetPromptResult> {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      throw new Error(`Prompt not found: ${name}`);
    }

    try {
      return await prompt.handler(args);
    } catch (error) {
      this.logger.error(`Prompt execution failed: ${name}`, error, { args });
      throw error;
    }
  }

  // Prompt Handlers

  private async handleDesignUITemplate(args: Record<string, unknown>): Promise<GetPromptResult> {
    const { requirements, context, templateType } = args as {
      requirements: string;
      context?: string;
      templateType?: string;
    };

    const messages: PromptMessage[] = [
      {
        role: 'system',
        content: {
          type: 'text',
          text: `You are an expert UI/UX designer specializing in creating dynamic templates. Your goal is to analyze user requirements and provide detailed specifications for template generation.

You have access to these template types:
- dashboard: Business analytics dashboards with metrics and charts
- dataTable: Sortable, filterable tables with pagination
- productCatalog: E-commerce product listings with search and filters
- form: Multi-section forms with validation and various input types
- analytics: Comprehensive analytics dashboards with KPIs
- gallery: Image galleries with lightbox and categorization
- calendar: Event management and scheduling interfaces
- kanban: Task management boards with drag-and-drop
- chart: Data visualization with multiple chart types
- feed: Activity feeds and social media layouts
- stats: KPI displays with progress indicators
- timeline: Event timelines with media support
- profileCard: User profile displays
- pricing: Pricing plans and comparison tables
- wizard: Multi-step forms and processes
- map: Interactive maps with markers
- marketplace: Multi-vendor marketplaces
- ecommerce: Shopping interfaces
- blog: Blog layouts with posts
- portfolio: Project showcases

Your task is to:
1. Analyze the user requirements
2. Suggest the most appropriate template type
3. Provide specific configuration recommendations
4. Include sample data structure if relevant
5. Suggest UI/UX best practices

Be specific and actionable in your recommendations.`
        }
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please help me design a UI template based on these requirements:

Requirements: ${requirements}

${context ? `Additional Context: ${context}` : ''}

${templateType ? `Preferred Template Type: ${templateType}` : ''}

Please provide:
1. Recommended template type and why
2. Specific configuration details
3. Sample data structure
4. UI/UX recommendations
5. Performance considerations`
        }
      }
    ];

    return {
      description: 'AI-assisted template design based on user requirements',
      messages
    };
  }

  private async handleAnalyzeRequirements(args: Record<string, unknown>): Promise<GetPromptResult> {
    const { description, industry, audience } = args as {
      description: string;
      industry?: string;
      audience?: string;
    };

    const messages: PromptMessage[] = [
      {
        role: 'system',
        content: {
          type: 'text',
          text: `You are a requirements analyst specializing in UI/UX design. Your role is to analyze user descriptions and break them down into structured requirements for template generation.

Focus on:
1. Identifying the core functionality needed
2. Understanding the user's goals and constraints
3. Determining data requirements
4. Suggesting appropriate template types
5. Identifying potential challenges and solutions

Provide structured, actionable analysis that can guide template selection and configuration.`
        }
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze these requirements and provide structured recommendations:

Description: ${description}

${industry ? `Industry: ${industry}` : ''}

${audience ? `Target Audience: ${audience}` : ''}

Please provide:
1. Core functionality analysis
2. Data requirements
3. Template type recommendations (ranked)
4. Key features needed
5. Potential challenges and solutions
6. Success metrics to consider`
        }
      }
    ];

    return {
      description: 'Requirements analysis for optimal template design',
      messages
    };
  }

  private async handleOptimizePerformance(args: Record<string, unknown>): Promise<GetPromptResult> {
    const { templateConfig, dataSize } = args as {
      templateConfig: string;
      dataSize?: string;
    };

    const messages: PromptMessage[] = [
      {
        role: 'system',
        content: {
          type: 'text',
          text: `You are a performance optimization expert for UI templates. Your role is to analyze template configurations and provide specific recommendations for improving performance, scalability, and user experience.

Consider:
1. Data loading and pagination strategies
2. Caching opportunities
3. Rendering optimizations
4. Mobile performance
5. Accessibility improvements
6. Code splitting possibilities

Provide specific, actionable recommendations with reasoning.`
        }
      },
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Please analyze this template configuration and provide performance optimization recommendations:

Template Configuration:
${templateConfig}

${dataSize ? `Expected Data Size: ${dataSize}` : ''}

Please provide:
1. Performance bottleneck analysis
2. Specific optimization recommendations
3. Caching strategies
4. Mobile optimization tips
5. Accessibility improvements
6. Scalability considerations
7. Implementation priorities`
        }
      }
    ];

    return {
      description: 'Performance optimization analysis for template configuration',
      messages
    };
  }
}

interface PromptDefinition {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
  handler: (args: Record<string, unknown>) => Promise<GetPromptResult>;
}