/**
 * Analytics Generator - Analytics dashboards and metrics
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const AnalyticsConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  metrics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.number(),
    change: z.number().optional(),
    trend: z.enum(['up', 'down', 'stable']).default('stable')
  })).default([]),
  charts: z.array(z.object({
    id: z.string(),
    type: z.enum(['line', 'bar', 'pie', 'area']).default('line'),
    title: z.string(),
    data: z.array(z.any()).default([])
  })).default([])
});

type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;

export class AnalyticsGenerator implements TemplateGenerator<AnalyticsConfig> {
  name = 'Analytics Generator';
  description = 'Generate analytics dashboards and metrics displays';
  capabilities = ['KPI metrics', 'Chart visualization', 'Trend analysis', 'Performance tracking'];
  useCases = ['Business dashboards', 'Performance monitoring', 'Data visualization', 'Reporting'];
  schema = AnalyticsConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<AnalyticsConfig> {
    return {
      id: 'analytics-dashboard',
      title: params.title || 'Analytics Dashboard',
      description: 'Monitor your key performance indicators',
      metrics: [
        { id: 'revenue', name: 'Revenue', value: 125000, change: 12.5, trend: 'up' },
        { id: 'users', name: 'Active Users', value: 2450, change: -3.2, trend: 'down' },
        { id: 'conversion', name: 'Conversion Rate', value: 3.8, change: 0.5, trend: 'up' }
      ],
      charts: [
        { id: 'revenue-chart', type: 'line', title: 'Revenue Trend', data: [] },
        { id: 'users-chart', type: 'bar', title: 'User Growth', data: [] }
      ]
    };
  }

  async validate(config: AnalyticsConfig): Promise<boolean> {
    try {
      AnalyticsConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<AnalyticsConfig[]> {
    return [await this.generate({ templateType: 'analytics', title: 'Example Analytics' })];
  }
}