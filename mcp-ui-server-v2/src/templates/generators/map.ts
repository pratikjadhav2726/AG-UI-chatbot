/**
 * Map Generator - Maps and location displays
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const MapConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional()
});

type MapConfig = z.infer<typeof MapConfigSchema>;

export class MapGenerator implements TemplateGenerator<MapConfig> {
  name = 'Map Generator';
  description = 'Generate maps and location-based displays';
  capabilities = ['Interactive maps', 'Location markers', 'Geographic data'];
  useCases = ['Store locators', 'Event maps', 'Geographic visualization'];
  schema = MapConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<MapConfig> {
    return {
      id: 'location-map',
      title: params.title || 'Location Map',
      description: 'Interactive map with locations'
    };
  }

  async validate(config: MapConfig): Promise<boolean> {
    try {
      MapConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<MapConfig[]> {
    return [await this.generate({ templateType: 'map', title: 'Example Map' })];
  }
}