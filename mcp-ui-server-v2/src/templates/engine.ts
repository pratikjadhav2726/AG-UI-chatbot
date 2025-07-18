/**
 * Template Engine - Core template generation system
 * Provides dynamic template generation with full customization support
 */

import { getLogger } from '../core/logger.js';
import { TemplateError } from '../utils/errors.js';
import type { TemplateGenerationParams, TemplateType } from '../types/mcp.js';
import { DashboardGenerator } from './generators/dashboard.js';
import { FormGenerator } from './generators/form.js';
import { DataTableGenerator } from './generators/data-table.js';
import { ProductCatalogGenerator } from './generators/product-catalog.js';
import { GalleryGenerator } from './generators/gallery.js';
import { AnalyticsGenerator } from './generators/analytics.js';
import { CalendarGenerator } from './generators/calendar.js';
import { KanbanGenerator } from './generators/kanban.js';
import { ChartGenerator } from './generators/chart.js';
import { FeedGenerator } from './generators/feed.js';
import { StatsGenerator } from './generators/stats.js';
import { TimelineGenerator } from './generators/timeline.js';
import { ProfileCardGenerator } from './generators/profile-card.js';
import { PricingGenerator } from './generators/pricing.js';
import { WizardGenerator } from './generators/wizard.js';
import { MapGenerator } from './generators/map.js';
import { MarketplaceGenerator } from './generators/marketplace.js';
import { EcommerceGenerator } from './generators/ecommerce.js';
import { BlogGenerator } from './generators/blog.js';
import { PortfolioGenerator } from './generators/portfolio.js';
import { SampleDataGenerator } from './generators/sample-data.js';

export interface TemplateGenerator<T = any> {
  name: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  schema: any;
  
  generate(params: TemplateGenerationParams): Promise<T>;
  validate(config: T): Promise<boolean>;
  getExamples(): Promise<T[]>;
}

export interface TemplateStats {
  totalTemplates: number;
  generatedCount: number;
  cacheHitRate: number;
  averageGenerationTime: number;
  popularTemplates: Array<{ type: string; count: number }>;
}

export class TemplateEngine {
  private generators = new Map<TemplateType, TemplateGenerator>();
  private logger = getLogger();
  private stats: TemplateStats = {
    totalTemplates: 0,
    generatedCount: 0,
    cacheHitRate: 0,
    averageGenerationTime: 0,
    popularTemplates: []
  };
  private generationTimes: number[] = [];
  private sampleDataGenerator: SampleDataGenerator;

  constructor() {
    this.sampleDataGenerator = new SampleDataGenerator();
  }

  async initialize(): Promise<void> {
    try {
      // Register all template generators
      await this.registerGenerators();
      
      this.logger.info('Template Engine initialized', {
        generatorCount: this.generators.size,
        availableTypes: Array.from(this.generators.keys())
      });
    } catch (error) {
      this.logger.error('Failed to initialize Template Engine', error);
      throw error;
    }
  }

  /**
   * Register all template generators
   */
  private async registerGenerators(): Promise<void> {
    // Core generators with full dynamic support
    this.registerGenerator('dashboard', new DashboardGenerator());
    this.registerGenerator('form', new FormGenerator());
    this.registerGenerator('dataTable', new DataTableGenerator());
    this.registerGenerator('productCatalog', new ProductCatalogGenerator());
    this.registerGenerator('gallery', new GalleryGenerator());
    this.registerGenerator('analytics', new AnalyticsGenerator());
    
    // Enhanced generators
    this.registerGenerator('calendar', new CalendarGenerator());
    this.registerGenerator('kanban', new KanbanGenerator());
    this.registerGenerator('chart', new ChartGenerator());
    this.registerGenerator('feed', new FeedGenerator());
    this.registerGenerator('stats', new StatsGenerator());
    this.registerGenerator('timeline', new TimelineGenerator());
    this.registerGenerator('profileCard', new ProfileCardGenerator());
    this.registerGenerator('pricing', new PricingGenerator());
    this.registerGenerator('wizard', new WizardGenerator());
    this.registerGenerator('map', new MapGenerator());
    this.registerGenerator('marketplace', new MarketplaceGenerator());
    this.registerGenerator('ecommerce', new EcommerceGenerator());
    this.registerGenerator('blog', new BlogGenerator());
    this.registerGenerator('portfolio', new PortfolioGenerator());

    this.stats.totalTemplates = this.generators.size;
  }

  /**
   * Register a template generator
   */
  private registerGenerator(type: TemplateType, generator: TemplateGenerator): void {
    this.generators.set(type, generator);
    this.logger.debug('Template generator registered', { 
      type, 
      name: generator.name,
      capabilities: generator.capabilities.length 
    });
  }

  /**
   * Generate a template with the given parameters
   */
  async generateTemplate(params: TemplateGenerationParams): Promise<any> {
    const startTime = Date.now();
    
    try {
      const generator = this.generators.get(params.templateType);
      if (!generator) {
        throw new TemplateError(params.templateType, `Template type not found: ${params.templateType}`);
      }

      this.logger.debug('Generating template', {
        type: params.templateType,
        title: params.title,
        useCase: params.useCase
      });

      // Generate the template
      const result = await generator.generate(params);
      
      // Update statistics
      const duration = Date.now() - startTime;
      this.updateStats(params.templateType, duration);
      
      this.logger.info('Template generated successfully', {
        type: params.templateType,
        title: params.title,
        duration,
        size: this.estimateSize(result)
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Template generation failed', error, {
        type: params.templateType,
        title: params.title,
        duration
      });
      
      if (error instanceof TemplateError) {
        throw error;
      }
      
      throw new TemplateError(
        params.templateType, 
        error instanceof Error ? error.message : 'Unknown generation error'
      );
    }
  }

  /**
   * Get available template types with their capabilities
   */
  async getAvailableTemplates(): Promise<Array<{
    type: TemplateType;
    name: string;
    description: string;
    capabilities: string[];
    useCases: string[];
    schema: any;
  }>> {
    return Array.from(this.generators.entries()).map(([type, generator]) => ({
      type,
      name: generator.name,
      description: generator.description,
      capabilities: generator.capabilities,
      useCases: generator.useCases,
      schema: generator.schema
    }));
  }

  /**
   * Get schema for a specific template type
   */
  async getTemplateSchema(templateType: string): Promise<any> {
    const generator = this.generators.get(templateType as TemplateType);
    if (!generator) {
      throw new TemplateError(templateType, `Template type not found: ${templateType}`);
    }

    return {
      templateType,
      name: generator.name,
      description: generator.description,
      schema: generator.schema,
      capabilities: generator.capabilities,
      useCases: generator.useCases,
      examples: await generator.getExamples().catch(() => [])
    };
  }

  /**
   * Validate a template configuration
   */
  async validateTemplate(templateType: string, config: any): Promise<boolean> {
    const generator = this.generators.get(templateType as TemplateType);
    if (!generator) {
      throw new TemplateError(templateType, `Template type not found: ${templateType}`);
    }

    try {
      return await generator.validate(config);
    } catch (error) {
      this.logger.warn('Template validation failed', {
        templateType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  /**
   * Generate sample data
   */
  async generateSampleData(dataType: string, count: number, seed?: string): Promise<any> {
    try {
      return await this.sampleDataGenerator.generate(dataType, count, seed);
    } catch (error) {
      this.logger.error('Sample data generation failed', error, { dataType, count, seed });
      throw new TemplateError('sample-data', `Failed to generate ${dataType} data: ${error}`);
    }
  }

  /**
   * Get template generation statistics
   */
  async getStats(): Promise<TemplateStats> {
    // Calculate average generation time
    if (this.generationTimes.length > 0) {
      this.stats.averageGenerationTime = 
        this.generationTimes.reduce((sum, time) => sum + time, 0) / this.generationTimes.length;
    }

    return { ...this.stats };
  }

  /**
   * Get examples for a template type
   */
  async getTemplateExamples(templateType: string): Promise<any[]> {
    const generator = this.generators.get(templateType as TemplateType);
    if (!generator) {
      throw new TemplateError(templateType, `Template type not found: ${templateType}`);
    }

    try {
      return await generator.getExamples();
    } catch (error) {
      this.logger.warn('Failed to get template examples', {
        templateType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  /**
   * Get generator capabilities
   */
  getGeneratorCapabilities(templateType: string): string[] {
    const generator = this.generators.get(templateType as TemplateType);
    return generator ? generator.capabilities : [];
  }

  /**
   * Check if a template type is supported
   */
  isTemplateSupported(templateType: string): boolean {
    return this.generators.has(templateType as TemplateType);
  }

  /**
   * Get recommended templates based on use case
   */
  getRecommendedTemplates(useCase: string): Array<{
    type: TemplateType;
    name: string;
    relevanceScore: number;
    reason: string;
  }> {
    const recommendations: Array<{
      type: TemplateType;
      name: string;
      relevanceScore: number;
      reason: string;
    }> = [];

    const lowerUseCase = useCase.toLowerCase();

    for (const [type, generator] of this.generators) {
      let relevanceScore = 0;
      let reason = '';

      // Check use cases
      for (const generatorUseCase of generator.useCases) {
        if (generatorUseCase.toLowerCase().includes(lowerUseCase) || 
            lowerUseCase.includes(generatorUseCase.toLowerCase())) {
          relevanceScore += 3;
          reason = `Matches use case: ${generatorUseCase}`;
          break;
        }
      }

      // Check capabilities
      for (const capability of generator.capabilities) {
        if (capability.toLowerCase().includes(lowerUseCase) || 
            lowerUseCase.includes(capability.toLowerCase())) {
          relevanceScore += 2;
          if (!reason) reason = `Supports capability: ${capability}`;
          break;
        }
      }

      // Check template name and description
      if (generator.name.toLowerCase().includes(lowerUseCase) ||
          generator.description.toLowerCase().includes(lowerUseCase)) {
        relevanceScore += 1;
        if (!reason) reason = `Related to template type`;
      }

      if (relevanceScore > 0) {
        recommendations.push({
          type,
          name: generator.name,
          relevanceScore,
          reason
        });
      }
    }

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Update internal statistics
   */
  private updateStats(templateType: TemplateType, duration: number): void {
    this.stats.generatedCount++;
    this.generationTimes.push(duration);

    // Keep only last 1000 generation times to prevent memory bloat
    if (this.generationTimes.length > 1000) {
      this.generationTimes = this.generationTimes.slice(-1000);
    }

    // Update popular templates
    const existing = this.stats.popularTemplates.find(t => t.type === templateType);
    if (existing) {
      existing.count++;
    } else {
      this.stats.popularTemplates.push({ type: templateType, count: 1 });
    }

    // Sort and keep top 10
    this.stats.popularTemplates.sort((a, b) => b.count - a.count);
    if (this.stats.popularTemplates.length > 10) {
      this.stats.popularTemplates = this.stats.popularTemplates.slice(0, 10);
    }
  }

  /**
   * Estimate the size of a generated template
   */
  private estimateSize(template: any): number {
    try {
      return JSON.stringify(template).length;
    } catch {
      return 0;
    }
  }

  /**
   * Clear statistics
   */
  clearStats(): void {
    this.stats = {
      totalTemplates: this.generators.size,
      generatedCount: 0,
      cacheHitRate: 0,
      averageGenerationTime: 0,
      popularTemplates: []
    };
    this.generationTimes = [];
    
    this.logger.info('Template engine statistics cleared');
  }

  /**
   * Get generator for a specific template type
   */
  getGenerator(templateType: TemplateType): TemplateGenerator | undefined {
    return this.generators.get(templateType);
  }

  /**
   * Get all registered template types
   */
  getRegisteredTypes(): TemplateType[] {
    return Array.from(this.generators.keys());
  }
}