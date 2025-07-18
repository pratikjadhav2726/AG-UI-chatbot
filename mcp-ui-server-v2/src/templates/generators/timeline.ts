/**
 * Timeline Generator - Timeline and chronological views
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const TimelineConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    type: z.enum(['milestone', 'event', 'achievement']).default('event'),
    icon: z.string().optional()
  })).default([])
});

type TimelineConfig = z.infer<typeof TimelineConfigSchema>;

export class TimelineGenerator implements TemplateGenerator<TimelineConfig> {
  name = 'Timeline Generator';
  description = 'Generate timeline and chronological views';
  capabilities = ['Chronological display', 'Event tracking', 'Progress visualization'];
  useCases = ['Project timelines', 'Company history', 'Process flows', 'Event history'];
  schema = TimelineConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<TimelineConfig> {
    return {
      id: 'project-timeline',
      title: params.title || 'Project Timeline',
      description: 'Key milestones and events',
      events: [
        {
          id: '1',
          title: 'Project Started',
          description: 'Initial project kickoff and team formation',
          date: '2024-01-01',
          type: 'milestone',
          icon: 'Play'
        },
        {
          id: '2',
          title: 'MVP Released',
          description: 'First version of the product launched',
          date: '2024-03-15',
          type: 'achievement',
          icon: 'Award'
        }
      ]
    };
  }

  async validate(config: TimelineConfig): Promise<boolean> {
    try {
      TimelineConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<TimelineConfig[]> {
    return [await this.generate({ templateType: 'timeline', title: 'Example Timeline' })];
  }
}