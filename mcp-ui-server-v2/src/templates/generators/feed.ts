/**
 * Feed Generator - Activity feeds and timelines
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const FeedConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    type: z.enum(['post', 'comment', 'like', 'share']).default('post'),
    author: z.string(),
    content: z.string(),
    timestamp: z.string(),
    avatar: z.string().optional()
  })).default([])
});

type FeedConfig = z.infer<typeof FeedConfigSchema>;

export class FeedGenerator implements TemplateGenerator<FeedConfig> {
  name = 'Feed Generator';
  description = 'Generate activity feeds and social media style content';
  capabilities = ['Activity streams', 'Social feeds', 'Real-time updates'];
  useCases = ['Social media', 'Activity logs', 'News feeds', 'Notification centers'];
  schema = FeedConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<FeedConfig> {
    return {
      id: 'activity-feed',
      title: params.title || 'Activity Feed',
      description: 'Recent activity and updates',
      items: [
        {
          id: '1',
          type: 'post',
          author: 'John Doe',
          content: 'Just completed the new project milestone!',
          timestamp: '2024-01-15T10:30:00Z',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        }
      ]
    };
  }

  async validate(config: FeedConfig): Promise<boolean> {
    try {
      FeedConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<FeedConfig[]> {
    return [await this.generate({ templateType: 'feed', title: 'Example Feed' })];
  }
}