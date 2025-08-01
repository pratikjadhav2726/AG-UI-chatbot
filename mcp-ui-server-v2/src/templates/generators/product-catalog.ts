/**
 * Product Catalog Generator - Dynamic product listings with filtering and shopping features
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  image: z.string(),
  images: z.array(z.string()).optional(),
  category: z.string(),
  brand: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional(),
  inStock: z.boolean().default(true),
  stock: z.number().optional(),
  sku: z.string().optional(),
  tags: z.array(z.string()).default([]),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    value: z.string(),
    price: z.number().optional(),
    inStock: z.boolean().default(true)
  })).optional(),
  specifications: z.record(z.string()).optional()
});

const ProductCatalogConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  products: z.array(ProductSchema),
  layout: z.object({
    type: z.enum(['grid', 'list', 'masonry']).default('grid'),
    columns: z.number().min(1).max(6).default(3),
    spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
    cardStyle: z.enum(['minimal', 'detailed', 'hover', 'overlay']).default('detailed')
  }),
  features: z.object({
    search: z.boolean().default(true),
    filters: z.object({
      category: z.boolean().default(true),
      price: z.boolean().default(true),
      brand: z.boolean().default(true),
      rating: z.boolean().default(true),
      availability: z.boolean().default(true)
    }),
    sorting: z.object({
      enabled: z.boolean().default(true),
      options: z.array(z.string()).default(['name', 'price', 'rating', 'newest'])
    }),
    pagination: z.object({
      enabled: z.boolean().default(true),
      pageSize: z.number().default(12),
      showTotal: z.boolean().default(true)
    }),
    wishlist: z.boolean().default(true),
    compare: z.boolean().default(false),
    quickView: z.boolean().default(true)
  }),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    count: z.number().optional(),
    image: z.string().optional()
  })).default([]),
  brands: z.array(z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().optional()
  })).default([]),
  priceRange: z.object({
    min: z.number(),
    max: z.number()
  }).optional(),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    primaryColor: z.string().default('#3b82f6'),
    borderRadius: z.enum(['none', 'sm', 'md', 'lg']).default('md')
  })
});

type ProductCatalogConfig = z.infer<typeof ProductCatalogConfigSchema>;

export class ProductCatalogGenerator implements TemplateGenerator<ProductCatalogConfig> {
  name = 'Product Catalog Generator';
  description = 'Generate dynamic product catalogs with filtering, search, and shopping features';
  capabilities = [
    'Product grids and lists',
    'Advanced filtering',
    'Search functionality',
    'Price ranges',
    'Category navigation',
    'Product variants',
    'Wishlist support',
    'Quick view modals',
    'Responsive layouts'
  ];
  useCases = [
    'E-commerce stores',
    'Product showcases',
    'Inventory displays',
    'Marketplace listings',
    'Brand catalogs',
    'Wholesale portals',
    'Digital marketplaces',
    'B2B catalogs'
  ];
  schema = ProductCatalogConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<ProductCatalogConfig> {
    if (params.customData?.catalog) {
      return ProductCatalogConfigSchema.parse(params.customData.catalog);
    }

    return this.generateCatalogByUseCase(params);
  }

  async validate(config: ProductCatalogConfig): Promise<boolean> {
    try {
      ProductCatalogConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<ProductCatalogConfig[]> {
    return [
      this.generateElectronicsCatalog(),
      this.generateFashionCatalog(),
      this.generateHomeCatalog()
    ];
  }

  private generateCatalogByUseCase(params: TemplateGenerationParams): ProductCatalogConfig {
    const useCase = params.useCase?.toLowerCase() || '';
    const title = params.title || 'Product Catalog';

    if (useCase.includes('electronics') || useCase.includes('tech')) {
      return this.generateElectronicsCatalog(title);
    } else if (useCase.includes('fashion') || useCase.includes('clothing')) {
      return this.generateFashionCatalog(title);
    } else if (useCase.includes('home') || useCase.includes('furniture')) {
      return this.generateHomeCatalog(title);
    } else {
      return this.generateGenericCatalog(title);
    }
  }

  private generateElectronicsCatalog(title: string = 'Electronics Store'): ProductCatalogConfig {
    return {
      id: 'electronics-catalog',
      title,
      description: 'Discover the latest in technology and electronics',
      products: [
        {
          id: 'prod-1',
          name: 'Wireless Noise-Canceling Headphones',
          description: 'Premium wireless headphones with active noise cancellation',
          price: 299.99,
          originalPrice: 349.99,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
          category: 'Audio',
          brand: 'TechSound',
          rating: 4.5,
          reviews: 234,
          inStock: true,
          stock: 15,
          sku: 'TS-WH-001',
          tags: ['wireless', 'noise-canceling', 'premium'],
          variants: [
            { id: 'color-black', name: 'Color', value: 'Black', inStock: true },
            { id: 'color-white', name: 'Color', value: 'White', inStock: true },
            { id: 'color-blue', name: 'Color', value: 'Blue', inStock: false }
          ]
        },
        {
          id: 'prod-2',
          name: 'Smartphone Pro Max',
          description: 'Latest smartphone with advanced camera system',
          price: 999.99,
          image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
          category: 'Mobile',
          brand: 'TechPhone',
          rating: 4.8,
          reviews: 1526,
          inStock: true,
          stock: 8,
          sku: 'TP-PM-128',
          tags: ['5G', 'camera', 'premium']
        }
      ],
      layout: {
        type: 'grid',
        columns: 3,
        spacing: 'normal',
        cardStyle: 'detailed'
      },
      features: {
        search: true,
        filters: {
          category: true,
          price: true,
          brand: true,
          rating: true,
          availability: true
        },
        sorting: {
          enabled: true,
          options: ['name', 'price-low', 'price-high', 'rating', 'newest']
        },
        pagination: {
          enabled: true,
          pageSize: 12,
          showTotal: true
        },
        wishlist: true,
        compare: true,
        quickView: true
      },
      categories: [
        { id: 'audio', name: 'Audio', count: 45 },
        { id: 'mobile', name: 'Mobile Devices', count: 32 },
        { id: 'computers', name: 'Computers', count: 78 },
        { id: 'accessories', name: 'Accessories', count: 156 }
      ],
      brands: [
        { id: 'techsound', name: 'TechSound' },
        { id: 'techphone', name: 'TechPhone' },
        { id: 'compuware', name: 'CompuWare' }
      ],
      priceRange: { min: 0, max: 2000 },
      styling: {
        theme: 'auto',
        primaryColor: '#3b82f6',
        borderRadius: 'md'
      }
    };
  }

  private generateFashionCatalog(title: string = 'Fashion Store'): ProductCatalogConfig {
    return {
      id: 'fashion-catalog',
      title,
      description: 'Discover the latest fashion trends and styles',
      products: [
        {
          id: 'fashion-1',
          name: 'Premium Cotton T-Shirt',
          description: 'Soft, comfortable cotton t-shirt in various colors',
          price: 29.99,
          originalPrice: 39.99,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
          category: 'Tops',
          brand: 'StyleCo',
          rating: 4.3,
          reviews: 89,
          inStock: true,
          stock: 25,
          sku: 'SC-CT-001',
          tags: ['cotton', 'casual', 'comfortable'],
          variants: [
            { id: 'size-s', name: 'Size', value: 'S', inStock: true },
            { id: 'size-m', name: 'Size', value: 'M', inStock: true },
            { id: 'size-l', name: 'Size', value: 'L', inStock: true },
            { id: 'size-xl', name: 'Size', value: 'XL', inStock: false }
          ]
        }
      ],
      layout: {
        type: 'grid',
        columns: 4,
        spacing: 'normal',
        cardStyle: 'hover'
      },
      features: {
        search: true,
        filters: {
          category: true,
          price: true,
          brand: true,
          rating: true,
          availability: true
        },
        sorting: {
          enabled: true,
          options: ['newest', 'price-low', 'price-high', 'popular']
        },
        pagination: {
          enabled: true,
          pageSize: 16,
          showTotal: true
        },
        wishlist: true,
        compare: false,
        quickView: true
      },
      categories: [
        { id: 'tops', name: 'Tops', count: 124 },
        { id: 'bottoms', name: 'Bottoms', count: 89 },
        { id: 'dresses', name: 'Dresses', count: 67 },
        { id: 'accessories', name: 'Accessories', count: 203 }
      ],
      brands: [
        { id: 'styleco', name: 'StyleCo' },
        { id: 'fashionhouse', name: 'Fashion House' },
        { id: 'trendy', name: 'Trendy' }
      ],
      priceRange: { min: 0, max: 300 },
      styling: {
        theme: 'auto',
        primaryColor: '#ec4899',
        borderRadius: 'lg'
      }
    };
  }

  private generateHomeCatalog(title: string = 'Home & Garden'): ProductCatalogConfig {
    return {
      id: 'home-catalog',
      title,
      description: 'Beautiful furniture and home decor for every room',
      products: [
        {
          id: 'home-1',
          name: 'Modern Dining Table',
          description: 'Elegant oak dining table for 6 people',
          price: 899.99,
          image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400',
          category: 'Furniture',
          brand: 'HomeStyle',
          rating: 4.7,
          reviews: 156,
          inStock: true,
          stock: 3,
          sku: 'HS-DT-001',
          tags: ['furniture', 'dining', 'oak', 'modern']
        }
      ],
      layout: {
        type: 'grid',
        columns: 3,
        spacing: 'relaxed',
        cardStyle: 'detailed'
      },
      features: {
        search: true,
        filters: {
          category: true,
          price: true,
          brand: true,
          rating: true,
          availability: true
        },
        sorting: {
          enabled: true,
          options: ['featured', 'price-low', 'price-high', 'newest']
        },
        pagination: {
          enabled: true,
          pageSize: 9,
          showTotal: true
        },
        wishlist: true,
        compare: true,
        quickView: true
      },
      categories: [
        { id: 'furniture', name: 'Furniture', count: 89 },
        { id: 'decor', name: 'Home Decor', count: 234 },
        { id: 'lighting', name: 'Lighting', count: 67 },
        { id: 'textiles', name: 'Textiles', count: 145 }
      ],
      brands: [
        { id: 'homestyle', name: 'HomeStyle' },
        { id: 'comfort', name: 'Comfort Living' },
        { id: 'modern', name: 'Modern Home' }
      ],
      priceRange: { min: 0, max: 5000 },
      styling: {
        theme: 'auto',
        primaryColor: '#059669',
        borderRadius: 'md'
      }
    };
  }

  private generateGenericCatalog(title: string): ProductCatalogConfig {
    return {
      id: 'generic-catalog',
      title,
      description: 'Browse our collection of products',
      products: [],
      layout: {
        type: 'grid',
        columns: 3,
        spacing: 'normal',
        cardStyle: 'detailed'
      },
      features: {
        search: true,
        filters: {
          category: true,
          price: true,
          brand: false,
          rating: true,
          availability: true
        },
        sorting: {
          enabled: true,
          options: ['name', 'price', 'newest']
        },
        pagination: {
          enabled: true,
          pageSize: 12,
          showTotal: true
        },
        wishlist: false,
        compare: false,
        quickView: false
      },
      categories: [],
      brands: [],
      styling: {
        theme: 'auto',
        primaryColor: '#3b82f6',
        borderRadius: 'md'
      }
    };
  }
}