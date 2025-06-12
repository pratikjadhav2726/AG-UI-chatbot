import { templateSchemas, TemplateType, TemplateConfig } from "../schemas.js";
import { 
  DashboardGenerator, 
  DataTableGenerator, 
  ProductCatalogGenerator,
  FormGenerator,
  AnalyticsGenerator,
  GalleryGenerator,
  TemplateGenerator
} from "./generators.js";

// Template registry
export const templates: Record<TemplateType, TemplateGenerator<any>> = {
  dashboard: new DashboardGenerator(),
  dataTable: new DataTableGenerator(),
  productCatalog: new ProductCatalogGenerator(),
  form: new FormGenerator(),
  analytics: new AnalyticsGenerator(),
  gallery: new GalleryGenerator(),
  
  // Placeholder for other template types - using minimal generators
  profileCard: new AnalyticsGenerator(), // Reuse analytics for now
  timeline: new AnalyticsGenerator(),
  pricing: new AnalyticsGenerator(),
  stats: new AnalyticsGenerator(),
  calendar: new AnalyticsGenerator(),
  wizard: new FormGenerator(), // Reuse form for wizard
  chart: new AnalyticsGenerator(),
  map: new AnalyticsGenerator(),
  kanban: new AnalyticsGenerator(),
  feed: new AnalyticsGenerator(),
  marketplace: new ProductCatalogGenerator(), // Reuse product catalog
  ecommerce: new ProductCatalogGenerator(),
  blog: new AnalyticsGenerator(),
  portfolio: new AnalyticsGenerator()
};

// Export template schemas and types for validation
export { templateSchemas, TemplateType, TemplateConfig };

// Helper function to get template by type
export function getTemplate(type: TemplateType): TemplateGenerator<any> | undefined {
  return templates[type];
}

// Helper function to generate template config
export async function generateTemplate(
  type: TemplateType, 
  params: any = {}
): Promise<TemplateConfig<any>> {
  const template = getTemplate(type);
  if (!template) {
    throw new Error(`Template type "${type}" not found`);
  }
  
  return await template.generate(params);
}

// Helper function to get template schema
export function getTemplateSchema(type: TemplateType) {
  return templateSchemas[type];
}

// Helper function to validate template config
export function validateTemplateConfig(type: TemplateType, config: any): boolean {
  const schema = getTemplateSchema(type);
  return schema ? schema.safeParse(config).success : false;
}

// Helper function to generate example template
export async function generateTemplateExample(type: TemplateType): Promise<TemplateConfig<any>> {
  return await generateTemplate(type, {
    title: `Example ${type}`,
    description: `Example ${type} template`,
    theme: "system"
  });
}

// Helper function to get all available template types
export function getAvailableTemplates(): Array<{
  type: TemplateType;
  name: string;
  description: string;
  capabilities: string[];
  useCases: string[];
}> {
  return Object.entries(templates).map(([type, template]) => ({
    type: type as TemplateType,
    name: template.name,
    description: template.description,
    capabilities: template.capabilities,
    useCases: template.useCases
  }));
}