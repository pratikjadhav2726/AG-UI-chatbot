// This file contains schema definitions for all templates
// It can be used to:
// 1. Generate documentation for the Gemini model
// 2. Validate template configurations
// 3. Provide type safety for template components

// Base schema that all templates extend
export interface BaseTemplateSchema {
  templateType: string
  title: string
  description?: string
  theme?: "light" | "dark" | "system"
  primaryColor?: string
  fullScreen?: boolean
  closeButtonText?: string
  actionButtonText?: string
}

// Dashboard template schema
export interface DashboardSchema extends BaseTemplateSchema {
  templateType: "dashboard"
  layout?: "grid" | "columns" | "rows"
  metrics: Array<{
    id: string
    label: string
    value: string | number
    change?: number
    changeType?: "increase" | "decrease" | "neutral"
    icon?: string
    color?: string
  }>
  charts?: Array<{
    id: string
    type: "line" | "bar" | "pie" | "area"
    title: string
    data: any
    height?: number
  }>
  recentActivity?: Array<{
    id: string
    title: string
    description?: string
    timestamp: string
    icon?: string
  }>
}

// Data table template schema
export interface DataTableSchema extends BaseTemplateSchema {
  templateType: "dataTable"
  columns: Array<{
    id: string
    header: string
    accessorKey: string
    enableSorting?: boolean
    cell?: {
      type: "text" | "badge" | "image" | "actions"
      options?: Record<string, any>
    }
  }>
  data: Array<Record<string, any>>
  pagination?: {
    enabled?: boolean
    pageSize?: number
    pageSizeOptions?: number[]
  }
  filters?: Array<{
    id: string
    label: string
    type: "select" | "text" | "date" | "boolean"
    options?: Array<{ label: string; value: string }>
  }>
}

// Product catalog template schema
export interface ProductCatalogSchema extends BaseTemplateSchema {
  templateType: "productCatalog"
  layout?: "grid" | "list"
  products: Array<{
    id: string
    name: string
    description: string
    price: number
    currency?: string
    imageUrl?: string
    rating?: number
    badges?: string[]
    category?: string
    inStock?: boolean
  }>
  categories?: Array<{
    id: string
    name: string
  }>
  sorting?: {
    enabled?: boolean
    options?: Array<{
      label: string
      value: string
    }>
  }
}

// Profile card template schema
export interface ProfileCardSchema extends BaseTemplateSchema {
  templateType: "profileCard"
  profile: {
    name: string
    title?: string
    company?: string
    bio?: string
    avatarUrl?: string
    coverImageUrl?: string
    location?: string
    email?: string
    phone?: string
    website?: string
    socialLinks?: Array<{
      platform: string
      url: string
      icon?: string
    }>
    stats?: Array<{
      label: string
      value: string | number
    }>
  }
  actions?: Array<{
    label: string
    action: string
    variant?: "default" | "outline" | "ghost" | "link"
    icon?: string
  }>
}

// Timeline template schema
export interface TimelineSchema extends BaseTemplateSchema {
  templateType: "timeline"
  events: Array<{
    id: string
    title: string
    description?: string
    date: string
    icon?: string
    category?: string
    color?: string
    media?: {
      type: "image" | "video"
      url: string
    }
  }>
  layout?: "vertical" | "horizontal"
  groupByDate?: boolean
  filters?: Array<{
    id: string
    label: string
    type: "category" | "date"
    options?: Array<{ label: string; value: string }>
  }>
}

// Gallery template schema
export interface GallerySchema extends BaseTemplateSchema {
  templateType: "gallery"
  layout?: "grid" | "masonry" | "carousel"
  items: Array<{
    id: string
    title?: string
    description?: string
    imageUrl: string
    thumbnailUrl?: string
    category?: string
    tags?: string[]
    date?: string
  }>
  categories?: Array<{
    id: string
    name: string
  }>
  lightbox?: boolean
  columns?: number
}

// Pricing template schema
export interface PricingSchema extends BaseTemplateSchema {
  templateType: "pricing"
  currency?: string
  interval?: "monthly" | "yearly" | "one-time"
  showToggle?: boolean
  plans: Array<{
    id: string
    name: string
    description: string
    price: number
    discountedPrice?: number
    interval?: string
    features: Array<{
      text: string
      included?: boolean
      icon?: string
    }>
    cta: {
      text: string
      action: string
    }
    popular?: boolean
    color?: string
  }>
  comparison?: boolean
}

// Stats template schema
export interface StatsSchema extends BaseTemplateSchema {
  templateType: "stats"
  layout?: "grid" | "list"
  stats: Array<{
    id: string
    label: string
    value: string | number
    description?: string
    change?: number
    changeType?: "increase" | "decrease" | "neutral"
    icon?: string
    color?: string
    chart?: {
      type: "sparkline" | "radial"
      data: number[]
    }
  }>
  columns?: number
}

// Calendar template schema
export interface CalendarSchema extends BaseTemplateSchema {
  templateType: "calendar"
  view?: "month" | "week" | "day" | "agenda"
  events?: Array<{
    id: string
    title: string
    start: string
    end?: string
    allDay?: boolean
    location?: string
    description?: string
    category?: string
    color?: string
  }>
  categories?: Array<{
    id: string
    name: string
    color: string
  }>
  selectable?: boolean
  defaultDate?: string
}

// Wizard template schema
export interface WizardSchema extends BaseTemplateSchema {
  templateType: "wizard"
  steps: Array<{
    id: string
    title: string
    description?: string
    fields?: Array<{
      id: string
      type:
        | "text"
        | "number"
        | "email"
        | "password"
        | "textarea"
        | "select"
        | "checkbox"
        | "radio"
        | "date"
        | "time"
        | "file"
      label: string
      placeholder?: string
      required?: boolean
      options?: Array<{
        label: string
        value: string
      }>
      helpText?: string
    }>
    content?: string
  }>
  currentStep?: number
  orientation?: "horizontal" | "vertical"
  showStepIndicator?: boolean
  allowSkip?: boolean
  allowBack?: boolean
}

// Chart template schema
export interface ChartSchema extends BaseTemplateSchema {
  templateType: "chart"
  chartType: "line" | "bar" | "pie" | "area" | "scatter" | "radar" | "mixed"
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string | string[]
      type?: string
    }>
  }
  options?: {
    aspectRatio?: number
    responsive?: boolean
    maintainAspectRatio?: boolean
    showLegend?: boolean
    showTooltips?: boolean
    showGrid?: boolean
    stacked?: boolean
  }
  height?: number
  filters?: Array<{
    id: string
    label: string
    type: "select" | "date" | "range"
    options?: Array<{ label: string; value: string }>
  }>
}

// Map template schema
export interface MapSchema extends BaseTemplateSchema {
  templateType: "map"
  center: {
    lat: number
    lng: number
  }
  zoom?: number
  markers?: Array<{
    id: string
    position: {
      lat: number
      lng: number
    }
    title?: string
    description?: string
    icon?: string
    color?: string
  }>
  polygons?: Array<{
    id: string
    paths: Array<{
      lat: number
      lng: number
    }>
    fillColor?: string
    strokeColor?: string
    title?: string
  }>
  showControls?: boolean
  mapType?: "roadmap" | "satellite" | "hybrid" | "terrain"
  height?: number
}

// Kanban template schema
export interface KanbanSchema extends BaseTemplateSchema {
  templateType: "kanban"
  columns: Array<{
    id: string
    title: string
    color?: string
    limit?: number
    cards: Array<{
      id: string
      title: string
      description?: string
      labels?: Array<{
        text: string
        color: string
      }>
      dueDate?: string
      assignees?: Array<{
        name: string
        avatarUrl?: string
      }>
      attachments?: number
      comments?: number
      priority?: "low" | "medium" | "high" | "urgent"
    }>
  }>
  allowDragDrop?: boolean
  collapsibleColumns?: boolean
  filters?: Array<{
    id: string
    label: string
    type: "assignee" | "label" | "priority" | "dueDate"
    options?: Array<{ label: string; value: string }>
  }>
}

// Feed template schema
export interface FeedSchema extends BaseTemplateSchema {
  templateType: "feed"
  posts: Array<{
    id: string
    author: {
      name: string
      avatarUrl?: string
      title?: string
    }
    content: string
    timestamp: string
    media?: Array<{
      type: "image" | "video"
      url: string
      thumbnailUrl?: string
    }>
    likes?: number
    comments?: Array<{
      id: string
      author: {
        name: string
        avatarUrl?: string
      }
      content: string
      timestamp: string
      likes?: number
    }>
    tags?: string[]
  }>
  layout?: "timeline" | "grid" | "compact"
  allowComments?: boolean
  allowLikes?: boolean
  filters?: Array<{
    id: string
    label: string
    type: "author" | "tag" | "date"
    options?: Array<{ label: string; value: string }>
  }>
}

// Union type of all template schemas
export type TemplateSchema =
  | DashboardSchema
  | DataTableSchema
  | ProductCatalogSchema
  | ProfileCardSchema
  | TimelineSchema
  | GallerySchema
  | PricingSchema
  | StatsSchema
  | CalendarSchema
  | WizardSchema
  | ChartSchema
  | MapSchema
  | KanbanSchema
  | FeedSchema

// Function to get schema for a specific template type
export function getTemplateSchema(templateType: string): Record<string, any> {
  const schemas: Record<string, Record<string, any>> = {
    dashboard: {
      required: ["templateType", "title", "metrics"],
      properties: {
        metrics: {
          type: "array",
          description: "Array of metrics to display",
          items: {
            type: "object",
            required: ["id", "label", "value"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              value: { type: "string" },
              change: { type: "number", optional: true },
              changeType: {
                type: "string",
                enum: ["increase", "decrease", "neutral"],
                optional: true,
              },
              icon: { type: "string", optional: true },
              color: { type: "string", optional: true },
            },
          },
        },
        charts: {
          type: "array",
          description: "Array of charts to display",
          optional: true,
          items: {
            type: "object",
            required: ["id", "type", "title"],
            properties: {
              id: { type: "string" },
              type: {
                type: "string",
                enum: ["line", "bar", "pie", "area"],
              },
              title: { type: "string" },
              data: { type: "object" },
              height: { type: "number", optional: true },
            },
          },
        },
        recentActivity: {
          type: "array",
          description: "Array of recent activity items",
          optional: true,
          items: {
            type: "object",
            required: ["id", "title", "timestamp"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", optional: true },
              timestamp: { type: "string" },
              icon: { type: "string", optional: true },
            },
          },
        },
      },
    },

    dataTable: {
      required: ["templateType", "title", "columns", "data"],
      properties: {
        columns: {
          type: "array",
          description: "Array of column definitions",
          items: {
            type: "object",
            required: ["id", "header", "accessorKey"],
            properties: {
              id: { type: "string" },
              header: { type: "string" },
              accessorKey: { type: "string" },
              enableSorting: { type: "boolean", optional: true },
              cell: {
                type: "object",
                optional: true,
                properties: {
                  type: {
                    type: "string",
                    enum: ["text", "badge", "image", "actions"],
                  },
                  options: { type: "object", optional: true },
                },
              },
            },
          },
        },
        data: {
          type: "array",
          description: "Array of data objects",
          items: { type: "object" },
        },
      },
    },

    productCatalog: {
      required: ["templateType", "title", "products"],
      properties: {
        products: {
          type: "array",
          description: "Array of products to display",
          items: {
            type: "object",
            required: ["id", "name", "description", "price"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              currency: { type: "string", optional: true },
              imageUrl: { type: "string", optional: true },
              rating: { type: "number", optional: true },
              badges: { type: "array", items: { type: "string" }, optional: true },
              category: { type: "string", optional: true },
              inStock: { type: "boolean", optional: true },
            },
          },
        },
      },
    },

    profileCard: {
      required: ["templateType", "title", "profile"],
      properties: {
        profile: {
          type: "object",
          description: "Profile information",
          required: ["name"],
          properties: {
            name: { type: "string" },
            title: { type: "string", optional: true },
            company: { type: "string", optional: true },
            bio: { type: "string", optional: true },
            avatarUrl: { type: "string", optional: true },
            coverImageUrl: { type: "string", optional: true },
            location: { type: "string", optional: true },
            email: { type: "string", optional: true },
            phone: { type: "string", optional: true },
            website: { type: "string", optional: true },
          },
        },
      },
    },
  }

  return (
    schemas[templateType] || {
      error: `Schema not found for template type: ${templateType}`,
      availableTemplates: Object.keys(schemas),
    }
  )
}

// Function to generate example for a specific template type
export function getTemplateExample(templateType: string): Record<string, any> {
  const examples: Record<string, Record<string, any>> = {
    dashboard: {
      templateType: "dashboard",
      title: "Business Dashboard",
      description: "Key metrics for your business",
      metrics: [
        {
          id: "revenue",
          label: "Revenue",
          value: "$12,345",
          change: 12.3,
          changeType: "increase",
          icon: "barChart",
        },
        {
          id: "users",
          label: "Total Users",
          value: "1,234",
          change: 5.6,
          changeType: "increase",
          icon: "users",
        },
        {
          id: "conversion",
          label: "Conversion Rate",
          value: "3.2%",
          change: 0.8,
          changeType: "decrease",
          icon: "activity",
        },
      ],
    },

    dataTable: {
      templateType: "dataTable",
      title: "Customer Data",
      description: "List of all customers",
      columns: [
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
        },
        {
          id: "email",
          header: "Email",
          accessorKey: "email",
        },
        {
          id: "status",
          header: "Status",
          accessorKey: "status",
          cell: {
            type: "badge",
          },
        },
      ],
      data: [
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          status: "Active",
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          status: "Inactive",
        },
      ],
    },

    productCatalog: {
      templateType: "productCatalog",
      title: "Product Catalog",
      description: "Browse our products",
      products: [
        {
          id: "1",
          name: "Product One",
          description: "This is a great product",
          price: 99.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          rating: 4.5,
          inStock: true,
        },
        {
          id: "2",
          name: "Product Two",
          description: "Another amazing product",
          price: 149.99,
          imageUrl: "/placeholder.svg?height=200&width=200",
          rating: 4.2,
          inStock: true,
        },
      ],
    },

    profileCard: {
      templateType: "profileCard",
      title: "User Profile",
      profile: {
        name: "John Doe",
        title: "Software Engineer",
        company: "Tech Company",
        bio: "Passionate about building great software",
        avatarUrl: "/placeholder.svg?height=100&width=100",
        email: "john@example.com",
        location: "San Francisco, CA",
        socialLinks: [
          {
            platform: "twitter",
            url: "https://twitter.com/johndoe",
          },
          {
            platform: "linkedin",
            url: "https://linkedin.com/in/johndoe",
          },
        ],
      },
      actions: [
        {
          label: "Message",
          action: "message",
        },
        {
          label: "Follow",
          action: "follow",
          variant: "outline",
        },
      ],
    },
  }

  return (
    examples[templateType] || {
      error: `Example not found for template type: ${templateType}`,
      availableTemplates: Object.keys(examples),
    }
  )
}
