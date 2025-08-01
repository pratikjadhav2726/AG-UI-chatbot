/**
 * Ecommerce Generator - E-commerce and shopping
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const EcommerceConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional()
});

type EcommerceConfig = z.infer<typeof EcommerceConfigSchema>;

export class EcommerceGenerator implements TemplateGenerator<EcommerceConfig> {
  name = 'Ecommerce Generator';
  description = 'Generate e-commerce and shopping interfaces';
  capabilities = ['Product displays', 'Shopping cart', 'Checkout process'];
  useCases = ['Online stores', 'Product pages', 'Shopping experiences'];
  schema = EcommerceConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<EcommerceConfig> {
    return {
      id: 'ecommerce-store',
      title: params.title || 'Online Store',
      description: 'Complete e-commerce shopping experience'
    };
  }

  async validate(config: EcommerceConfig): Promise<boolean> {
    try {
      EcommerceConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<EcommerceConfig[]> {
    return [await this.generate({ templateType: 'ecommerce', title: 'Example Store' })];
  }
}