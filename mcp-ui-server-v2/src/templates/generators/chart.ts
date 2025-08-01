/**
 * Chart Generator - Charts and data visualization
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const ChartConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['line', 'bar', 'pie', 'area', 'scatter']).default('line'),
  data: z.object({
    labels: z.array(z.string()).default([]),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      color: z.string().optional()
    })).default([])
  }),
  options: z.object({
    responsive: z.boolean().default(true),
    legend: z.boolean().default(true),
    grid: z.boolean().default(true)
  }).default({})
});

type ChartConfig = z.infer<typeof ChartConfigSchema>;

export class ChartGenerator implements TemplateGenerator<ChartConfig> {
  name = 'Chart Generator';
  description = 'Generate charts and data visualization components';
  capabilities = ['Multiple chart types', 'Data visualization', 'Interactive charts'];
  useCases = ['Data analysis', 'Reporting', 'Dashboard widgets', 'Performance metrics'];
  schema = ChartConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<ChartConfig> {
    return {
      id: 'data-chart',
      title: params.title || 'Data Chart',
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Revenue',
            data: [12000, 15000, 18000, 16000, 22000, 25000],
            color: '#3b82f6'
          },
          {
            label: 'Expenses',
            data: [8000, 9000, 11000, 12000, 13000, 14000],
            color: '#ef4444'
          }
        ]
      },
      options: {
        responsive: true,
        legend: true,
        grid: true
      }
    };
  }

  async validate(config: ChartConfig): Promise<boolean> {
    try {
      ChartConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<ChartConfig[]> {
    return [await this.generate({ templateType: 'chart', title: 'Example Chart' })];
  }
}