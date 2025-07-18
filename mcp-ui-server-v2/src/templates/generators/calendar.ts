/**
 * Calendar Generator - Calendar and event scheduling
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const CalendarConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  view: z.enum(['month', 'week', 'day', 'agenda']).default('month'),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    start: z.string(),
    end: z.string(),
    color: z.string().optional()
  })).default([])
});

type CalendarConfig = z.infer<typeof CalendarConfigSchema>;

export class CalendarGenerator implements TemplateGenerator<CalendarConfig> {
  name = 'Calendar Generator';
  description = 'Generate calendar and event scheduling interfaces';
  capabilities = ['Event scheduling', 'Multiple views', 'Event management'];
  useCases = ['Event calendars', 'Scheduling', 'Meeting planning'];
  schema = CalendarConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<CalendarConfig> {
    return {
      id: 'calendar',
      title: params.title || 'Calendar',
      view: 'month',
      events: [
        { id: '1', title: 'Team Meeting', start: '2024-01-15T10:00:00', end: '2024-01-15T11:00:00', color: '#3b82f6' },
        { id: '2', title: 'Project Review', start: '2024-01-16T14:00:00', end: '2024-01-16T15:30:00', color: '#10b981' }
      ]
    };
  }

  async validate(config: CalendarConfig): Promise<boolean> {
    try {
      CalendarConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<CalendarConfig[]> {
    return [await this.generate({ templateType: 'calendar', title: 'Example Calendar' })];
  }
}