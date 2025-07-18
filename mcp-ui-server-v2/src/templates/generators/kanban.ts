/**
 * Kanban Generator - Kanban boards and task management
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const KanbanConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    color: z.string().optional(),
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      assignee: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high']).default('medium')
    })).default([])
  })).default([])
});

type KanbanConfig = z.infer<typeof KanbanConfigSchema>;

export class KanbanGenerator implements TemplateGenerator<KanbanConfig> {
  name = 'Kanban Generator';
  description = 'Generate kanban boards and task management interfaces';
  capabilities = ['Task organization', 'Drag and drop', 'Status tracking'];
  useCases = ['Project management', 'Task tracking', 'Workflow management'];
  schema = KanbanConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<KanbanConfig> {
    return {
      id: 'kanban-board',
      title: params.title || 'Kanban Board',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          color: '#64748b',
          tasks: [
            { id: '1', title: 'Setup project', priority: 'high', assignee: 'John' },
            { id: '2', title: 'Design mockups', priority: 'medium', assignee: 'Jane' }
          ]
        },
        {
          id: 'in-progress',
          title: 'In Progress',
          color: '#3b82f6',
          tasks: [
            { id: '3', title: 'Implement API', priority: 'high', assignee: 'Mike' }
          ]
        },
        {
          id: 'done',
          title: 'Done',
          color: '#10b981',
          tasks: [
            { id: '4', title: 'Project planning', priority: 'medium', assignee: 'Sarah' }
          ]
        }
      ]
    };
  }

  async validate(config: KanbanConfig): Promise<boolean> {
    try {
      KanbanConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<KanbanConfig[]> {
    return [await this.generate({ templateType: 'kanban', title: 'Example Kanban' })];
  }
}