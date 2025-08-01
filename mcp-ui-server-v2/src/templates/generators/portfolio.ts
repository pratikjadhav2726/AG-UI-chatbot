/**
 * Portfolio Generator - Portfolio and showcase layouts
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const PortfolioConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional()
});

type PortfolioConfig = z.infer<typeof PortfolioConfigSchema>;

export class PortfolioGenerator implements TemplateGenerator<PortfolioConfig> {
  name = 'Portfolio Generator';
  description = 'Generate portfolio and showcase layouts';
  capabilities = ['Project showcases', 'Work displays', 'Creative layouts'];
  useCases = ['Designer portfolios', 'Developer showcases', 'Creative professionals', 'Agency websites'];
  schema = PortfolioConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<PortfolioConfig> {
    return {
      id: 'portfolio',
      title: params.title || 'Portfolio',
      description: 'Showcase your best work'
    };
  }

  async validate(config: PortfolioConfig): Promise<boolean> {
    try {
      PortfolioConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<PortfolioConfig[]> {
    return [await this.generate({ templateType: 'portfolio', title: 'Example Portfolio' })];
  }
}