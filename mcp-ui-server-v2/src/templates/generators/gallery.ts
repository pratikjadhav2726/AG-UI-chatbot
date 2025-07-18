/**
 * Gallery Generator - Dynamic image and media galleries
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const GalleryItemSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  url: z.string(),
  thumbnail: z.string().optional(),
  type: z.enum(['image', 'video']).default('image'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).optional()
});

const GalleryConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  items: z.array(GalleryItemSchema),
  layout: z.object({
    type: z.enum(['grid', 'masonry', 'slider', 'lightbox']).default('grid'),
    columns: z.number().min(1).max(6).default(3),
    spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal')
  }),
  features: z.object({
    search: z.boolean().default(true),
    filter: z.boolean().default(true),
    lightbox: z.boolean().default(true),
    download: z.boolean().default(false),
    share: z.boolean().default(true)
  }),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg']).default('md')
  })
});

type GalleryConfig = z.infer<typeof GalleryConfigSchema>;

export class GalleryGenerator implements TemplateGenerator<GalleryConfig> {
  name = 'Gallery Generator';
  description = 'Generate dynamic image and media galleries with various layouts';
  capabilities = ['Grid layouts', 'Lightbox viewing', 'Category filtering', 'Image optimization', 'Responsive design'];
  useCases = ['Photo galleries', 'Portfolio showcases', 'Product images', 'Event photos', 'Art collections'];
  schema = GalleryConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<GalleryConfig> {
    if (params.customData?.gallery) {
      return GalleryConfigSchema.parse(params.customData.gallery);
    }

    return {
      id: 'gallery',
      title: params.title || 'Photo Gallery',
      description: 'A collection of beautiful images',
      items: this.generateSampleItems(),
      layout: { type: 'grid', columns: 3, spacing: 'normal' },
      features: { search: true, filter: true, lightbox: true, download: false, share: true },
      styling: { theme: 'auto', borderRadius: 'md' }
    };
  }

  async validate(config: GalleryConfig): Promise<boolean> {
    try {
      GalleryConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<GalleryConfig[]> {
    return [
      {
        id: 'photo-gallery',
        title: 'Photo Gallery',
        items: this.generateSampleItems(),
        layout: { type: 'grid', columns: 3, spacing: 'normal' },
        features: { search: true, filter: true, lightbox: true, download: false, share: true },
        styling: { theme: 'auto', borderRadius: 'md' }
      }
    ];
  }

  private generateSampleItems(): z.infer<typeof GalleryItemSchema>[] {
    return [
      {
        id: '1',
        title: 'Mountain Landscape',
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        type: 'image',
        category: 'nature',
        tags: ['mountain', 'landscape', 'nature']
      },
      {
        id: '2',
        title: 'City Skyline',
        url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',
        type: 'image',
        category: 'urban',
        tags: ['city', 'skyline', 'architecture']
      }
    ];
  }
}