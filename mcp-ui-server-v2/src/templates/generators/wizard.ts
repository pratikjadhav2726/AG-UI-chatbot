/**
 * Wizard Generator - Multi-step wizards and flows
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const WizardConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional()
});

type WizardConfig = z.infer<typeof WizardConfigSchema>;

export class WizardGenerator implements TemplateGenerator<WizardConfig> {
  name = 'Wizard Generator';
  description = 'Generate multi-step wizards and guided flows';
  capabilities = ['Step-by-step flows', 'Progress tracking', 'Form validation'];
  useCases = ['Onboarding', 'Setup processes', 'Data collection'];
  schema = WizardConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<WizardConfig> {
    return {
      id: 'setup-wizard',
      title: params.title || 'Setup Wizard',
      description: 'Complete the setup process step by step'
    };
  }

  async validate(config: WizardConfig): Promise<boolean> {
    try {
      WizardConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<WizardConfig[]> {
    return [await this.generate({ templateType: 'wizard', title: 'Example Wizard' })];
  }
}