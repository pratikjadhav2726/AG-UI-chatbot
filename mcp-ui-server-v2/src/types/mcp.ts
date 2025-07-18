/**
 * Core MCP Protocol Types
 * Based on MCP specification v2024-11-05
 */

import { z } from 'zod';

// =============================================================================
// Base Protocol Types
// =============================================================================

export const MCPProtocolVersion = '2024-11-05';

export interface MCPMessage {
  jsonrpc: '2.0';
}

export interface MCPRequest extends MCPMessage {
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse extends MCPMessage {
  id: string | number;
  result?: unknown;
  error?: MCPError;
}

export interface MCPNotification extends MCPMessage {
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPError {
  code: number;
  message: string;
  data?: unknown;
}

// =============================================================================
// Capability Types
// =============================================================================

export interface ServerCapabilities {
  tools?: ToolCapabilities;
  resources?: ResourceCapabilities;
  prompts?: PromptCapabilities;
  logging?: LoggingCapabilities;
}

export interface ClientCapabilities {
  roots?: RootCapabilities;
  sampling?: SamplingCapabilities;
}

export interface ToolCapabilities {
  listChanged?: boolean;
}

export interface ResourceCapabilities {
  subscribe?: boolean;
  listChanged?: boolean;
}

export interface PromptCapabilities {
  listChanged?: boolean;
}

export interface LoggingCapabilities {
  level?: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';
}

export interface RootCapabilities {
  listChanged?: boolean;
}

export interface SamplingCapabilities {}

// =============================================================================
// Tool Types
// =============================================================================

export interface Tool {
  name: string;
  description?: string;
  inputSchema: JSONSchema;
}

export interface ToolCall {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface ToolResult {
  content: Content[];
  isError?: boolean;
}

// =============================================================================
// Resource Types
// =============================================================================

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceTemplate {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ResourceContents {
  uri: string;
  mimeType?: string;
  content: Content[];
}

// =============================================================================
// Prompt Types
// =============================================================================

export interface Prompt {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: Content;
}

export interface GetPromptResult {
  description?: string;
  messages: PromptMessage[];
}

// =============================================================================
// Content Types
// =============================================================================

export type Content = TextContent | ImageContent | EmbeddedResource;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  data: string;
  mimeType: string;
}

export interface EmbeddedResource {
  type: 'resource';
  resource: {
    uri: string;
    text?: string;
    blob?: string;
  };
}

// =============================================================================
// JSON Schema Types
// =============================================================================

export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  additionalProperties?: boolean | JSONSchema;
  description?: string;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  examples?: unknown[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  multipleOf?: number;
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  allOf?: JSONSchema[];
  not?: JSONSchema;
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;
  title?: string;
  $schema?: string;
  $id?: string;
  $ref?: string;
  $defs?: Record<string, JSONSchema>;
}

// =============================================================================
// Template-Specific Types
// =============================================================================

export const TemplateTypeSchema = z.enum([
  'dashboard',
  'dataTable',
  'productCatalog',
  'profileCard',
  'timeline',
  'gallery',
  'pricing',
  'stats',
  'calendar',
  'wizard',
  'chart',
  'map',
  'kanban',
  'feed',
  'form',
  'marketplace',
  'analytics',
  'ecommerce',
  'blog',
  'portfolio'
]);

export type TemplateType = z.infer<typeof TemplateTypeSchema>;

export interface TemplateGenerationParams {
  templateType: TemplateType;
  title: string;
  description?: string;
  useCase?: string;
  theme?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  fullScreen?: boolean;
  customData?: Record<string, unknown>;
  images?: ImageData[];
  textContent?: Record<string, string>;
  brandingConfig?: BrandingConfig;
  dataSource?: DataSourceConfig;
  interactivity?: InteractivityConfig;
}

export interface ImageData {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface BrandingConfig {
  logoUrl?: string;
  brandName?: string;
  brandColors?: string[];
  fontFamily?: string;
  favicon?: string;
}

export interface DataSourceConfig {
  type: 'static' | 'api' | 'database' | 'file';
  url?: string;
  credentials?: Record<string, string>;
  query?: string;
  transformation?: string;
  refreshInterval?: number;
}

export interface InteractivityConfig {
  enableSearch?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableExport?: boolean;
  customActions?: ActionDefinition[];
}

export interface ActionDefinition {
  id: string;
  label: string;
  type: 'button' | 'link' | 'dropdown';
  trigger: 'onClick' | 'onSubmit' | 'onChange';
  action: {
    type: 'navigate' | 'api' | 'event' | 'mcp';
    target?: string;
    payload?: Record<string, unknown>;
  };
}

// =============================================================================
// Server Configuration Types
// =============================================================================

export interface ServerConfig {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  capabilities: ServerCapabilities;
  transport: TransportConfig;
  logging: LoggingConfig;
  cache: CacheConfig;
  security: SecurityConfig;
}

export interface TransportConfig {
  type: 'stdio' | 'sse' | 'websocket';
  host?: string;
  port?: number;
  path?: string;
  cors?: CORSConfig;
}

export interface CORSConfig {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  credentials?: boolean;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'pretty';
  destination?: string;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'lfu' | 'fifo';
}

export interface SecurityConfig {
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
  validation?: ValidationConfig;
}

export interface RateLimitConfig {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

export interface AuthConfig {
  enabled: boolean;
  type?: 'apiKey' | 'jwt' | 'oauth2';
  config?: Record<string, unknown>;
}

export interface ValidationConfig {
  enabled: boolean;
  sanitizeInputs: boolean;
  maxPayloadSize: number;
}