/**
 * Profile Card Generator - User profiles and cards
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const ProfileCardConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional()
});

type ProfileCardConfig = z.infer<typeof ProfileCardConfigSchema>;

export class ProfileCardGenerator implements TemplateGenerator<ProfileCardConfig> {
  name = 'Profile Card Generator';
  description = 'Generate user profile cards and displays';
  capabilities = ['User profiles', 'Avatar display', 'Contact information'];
  useCases = ['Team pages', 'User directories', 'Contact cards'];
  schema = ProfileCardConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<ProfileCardConfig> {
    return {
      id: 'profile-card',
      title: params.title || 'Profile Card',
      description: 'User profile information'
    };
  }

  async validate(config: ProfileCardConfig): Promise<boolean> {
    try {
      ProfileCardConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<ProfileCardConfig[]> {
    return [await this.generate({ templateType: 'profileCard', title: 'Example Profile' })];
  }
}