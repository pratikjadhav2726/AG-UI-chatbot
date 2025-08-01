/**
 * Stats Generator - Statistics and KPI displays
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const StatsConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  stats: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    icon: z.string().optional(),
    trend: z.object({
      direction: z.enum(['up', 'down', 'stable']).default('stable'),
      percentage: z.number().optional()
    }).optional()
  })).default([])
});

type StatsConfig = z.infer<typeof StatsConfigSchema>;

export class StatsGenerator implements TemplateGenerator<StatsConfig> {
  name = 'Stats Generator';
  description = 'Generate statistics and KPI displays';
  capabilities = ['Key metrics', 'Performance indicators', 'Trend visualization'];
  useCases = ['Dashboard widgets', 'Performance tracking', 'Business metrics', 'Analytics'];
  schema = StatsConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<StatsConfig> {
    return {
      id: 'key-stats',
      title: params.title || 'Key Statistics',
      description: 'Important metrics at a glance',
      stats: [
        {
          id: 'revenue',
          label: 'Total Revenue',
          value: '$125,430',
          icon: 'DollarSign',
          trend: { direction: 'up', percentage: 12.5 }
        },
        {
          id: 'users',
          label: 'Active Users',
          value: '2,458',
          icon: 'Users',
          trend: { direction: 'up', percentage: 8.2 }
        }
      ]
    };
  }

  async validate(config: StatsConfig): Promise<boolean> {
    try {
      StatsConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<StatsConfig[]> {
    return [await this.generate({ templateType: 'stats', title: 'Example Stats' })];
  }
}