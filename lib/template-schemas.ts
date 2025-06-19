// This file contains schema definitions for all templates
// It can be used to:
// 1. Generate documentation for the Gemini model
// 2. Validate template configurations
// 3. Provide type safety for template components

// Base schema that all templates extend
export type ActionTriggerType = "onClick" | "onSelect" | "onSubmit";
export type ActionType = "MCP_TOOL_CALL" | "CUSTOM_EVENT" | "NAVIGATE" | "API_CALL"; // Added API_CALL

export interface ActionSchema {
  id: string;
  label?: string; // Text for the button/element if this action defines it
  trigger: ActionTriggerType;
  type: ActionType;
  eventName?: string; // For CUSTOM_EVENT
  toolName?: string; // For MCP_TOOL_CALL
  arguments?: Record<string, any>; // For MCP_TOOL_CALL (static args or placeholders)
  apiUrl?: string; // For API_CALL
  apiMethod?: "GET" | "POST" | "PUT" | "DELETE"; // For API_CALL
  payload?: Record<string, any>; // For CUSTOM_EVENT, or body for POST/PUT API_CALL
                                 // Can contain placeholders like {{item.id}} or {{form.fieldId}}
  navigateTo?: string; // URL or path for NAVIGATE
  confirmationMessage?: string; // Optional message for confirmation dialog
}

export interface BaseTemplateSchema {
  templateType: string;
  title: string;
  description?: string;
  theme?: "light" | "dark" | "system";
  primaryColor?: string;
  fullScreen?: boolean;
  closeButtonText?: string;
  actionButtonText?: string; // Text for the main submit/action button in footer
  actions?: ActionSchema[]; // Actions associated with the template (e.g., footer buttons)
  customData?: Record<string, any>; // Moved from specific schemas to Base for evaluator context
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
    renderCondition?: string // Added
  }>
  charts?: Array<{
    id: string
    type: "line" | "bar" | "pie" | "area"
    title: string
    data: any
    height?: number
    renderCondition?: string // Added
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

// Define a schema for a single field within an item (simplified for item rendering)
export interface DynamicItemFieldSchema {
  id: string;
  type: "image" | "text" | "badge" | "button";
  source: string; // Path for data, e.g., "item.name"
  label?: string; // For button type, fallback to source if not provided
  style?: "title" | "description" | "price" | "label" | "tag" | "button";
  actionDefinition?: ActionSchema; // Replaces simple 'action' string for buttons
  altSource?: string;
  prefix?: string;
  suffix?: string;
  condition?: string;
}

export interface ProductCatalogSchema extends BaseTemplateSchema {
  templateType: "productCatalog";
  layout?: "grid" | "list"; // Default to 'grid'
  columns?: number; // Default to 3 for grid
  itemDataSource: string; // e.g., "customData.products" - path to the array of product data
  itemSchema: { // Defines how to render a single item
    fields: DynamicItemFieldSchema[];
    // Could also include item-level actions or styles here
  };
  // categories and sorting can remain as they are, operating on customData or handled by client
  categories?: Array<{ id: string; name: string; /* other fields */ }>;
  sorting?: { enabled?: boolean; options?: Array<{ label: string; value: string; }>; };
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
      renderCondition?: string // Added
    }>
  }
  actions?: Array<{
    label: "string"
    action: string
    variant?: "default" | "outline" | "ghost" | "link"
    icon?: string
    renderCondition?: string // Added
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
    renderCondition?: string // Added for sections
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
      renderCondition?: string // Added for fields
      validation?: { // Assuming validation structure from previous step
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        message?: string;
      };
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
    timeline: {
      required: ["templateType", "title", "events"],
      properties: {
        events: {
          type: "array",
          description: "Timeline events",
          items: {
            type: "object",
            required: ["id", "title", "date"],
            properties: {
              id: { type: "string", description: "Unique ID for the event" },
              title: { type: "string", description: "Title of the event" },
              description: { type: "string", optional: true, description: "Description of the event" },
              date: { type: "string", description: "Date of the event" },
              icon: { type: "string", optional: true, description: "Icon for the event" },
              category: { type: "string", optional: true, description: "Category of the event" },
              color: { type: "string", optional: true, description: "Color for the event" },
              media: {
                type: "object",
                optional: true,
                properties: {
                  type: { type: "string", enum: ["image", "video"], description: "Type of media" },
                  url: { type: "string", description: "URL of the media" },
                },
                required: ["type", "url"],
                description: "Media associated with the event",
              },
            },
          },
        },
        layout: { type: "string", enum: ["vertical", "horizontal"], optional: true, description: "Layout style" },
        groupByDate: { type: "boolean", optional: true, description: "Group events by date" },
        filters: {
          type: "array",
          optional: true,
          description: "Filter options",
          items: {
            type: "object",
            required: ["id", "label", "type"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              type: { type: "string", enum: ["category", "date"] },
              options: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string" },
                    value: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    gallery: {
      required: ["templateType", "title", "items"],
      properties: {
        items: {
          type: "array",
          description: "Gallery items",
          items: {
            type: "object",
            required: ["id", "imageUrl"],
            properties: {
              id: { type: "string" },
              title: { type: "string", optional: true },
              description: { type: "string", optional: true },
              imageUrl: { type: "string" },
              thumbnailUrl: { type: "string", optional: true },
              category: { type: "string", optional: true },
              tags: { type: "array", items: { type: "string" }, optional: true },
              date: { type: "string", optional: true },
            },
          },
        },
        layout: { type: "string", enum: ["grid", "masonry", "carousel"], optional: true, description: "Layout style" },
        categories: {
          type: "array",
          optional: true,
          description: "Item categories",
          items: {
            type: "object",
            required: ["id", "name"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
        lightbox: { type: "boolean", optional: true, description: "Enable lightbox for images" },
        columns: { type: "number", optional: true, description: "Number of columns in grid layout" },
      },
    },
    pricing: {
      required: ["templateType", "title", "plans"],
      properties: {
        plans: {
          type: "array",
          description: "Pricing plans",
          items: {
            type: "object",
            required: ["id", "name", "description", "price", "cta"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              discountedPrice: { type: "number", optional: true },
              interval: { type: "string", optional: true },
              features: {
                type: "array",
                items: {
                  type: "object",
                  required: ["text"],
                  properties: {
                    text: { type: "string" },
                    included: { type: "boolean", optional: true },
                    icon: { type: "string", optional: true },
                  },
                },
              },
              cta: {
                type: "object",
                required: ["text", "action"],
                properties: {
                  text: { type: "string" },
                  action: { type: "string" },
                },
              },
              popular: { type: "boolean", optional: true },
              color: { type: "string", optional: true },
            },
          },
        },
        currency: { type: "string", optional: true, description: "Currency for pricing" },
        interval: { type: "string", enum: ["monthly", "yearly", "one-time"], optional: true, description: "Billing interval" },
        showToggle: { type: "boolean", optional: true, description: "Show interval toggle" },
        comparison: { type: "boolean", optional: true, description: "Show comparison table" },
      },
    },
    stats: {
      required: ["templateType", "title", "stats"],
      properties: {
        stats: {
          type: "array",
          description: "Statistics to display",
          items: {
            type: "object",
            required: ["id", "label", "value"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              value: { type: "string" }, // Note: In Zod schema it's union, simplified to string here
              description: { type: "string", optional: true },
              change: { type: "number", optional: true },
              changeType: { type: "string", enum: ["increase", "decrease", "neutral"], optional: true },
              icon: { type: "string", optional: true },
              color: { type: "string", optional: true },
              chart: {
                type: "object",
                optional: true,
                properties: {
                  type: { type: "string", enum: ["sparkline", "radial"] },
                  data: { type: "array", items: { type: "number" } },
                },
                required: ["type", "data"],
              },
            },
          },
        },
        layout: { type: "string", enum: ["grid", "list"], optional: true, description: "Layout style" },
        columns: { type: "number", optional: true, description: "Number of columns in grid layout" },
      },
    },
    calendar: {
      required: ["templateType", "title"],
      properties: {
        view: { type: "string", enum: ["month", "week", "day", "agenda"], optional: true, description: "Calendar view" },
        events: {
          type: "array",
          optional: true,
          description: "Calendar events",
          items: {
            type: "object",
            required: ["id", "title", "start"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              start: { type: "string", description: "Event start date/time" },
              end: { type: "string", optional: true, description: "Event end date/time" },
              allDay: { type: "boolean", optional: true },
              location: { type: "string", optional: true },
              description: { type: "string", optional: true },
              category: { type: "string", optional: true },
              color: { type: "string", optional: true },
            },
          },
        },
        categories: {
          type: "array",
          optional: true,
          description: "Event categories",
          items: {
            type: "object",
            required: ["id", "name", "color"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              color: { type: "string" },
            },
          },
        },
        selectable: { type: "boolean", optional: true, description: "Allow date selection" },
        defaultDate: { type: "string", optional: true, description: "Default selected date" },
      },
    },
    wizard: {
      required: ["templateType", "title", "steps"],
      properties: {
        steps: {
          type: "array",
          description: "Wizard steps",
          items: {
            type: "object",
            required: ["id", "title"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", optional: true },
              fields: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["id", "type", "label"],
                  properties: {
                    id: { type: "string" },
                    type: {
                      type: "string",
                      enum: [
                        "text", "number", "email", "password", "textarea", "select",
                        "checkbox", "radio", "date", "time", "file",
                      ],
                    },
                    label: { type: "string" },
                    placeholder: { type: "string", optional: true },
                    required: { type: "boolean", optional: true },
                    options: {
                      type: "array",
                      optional: true,
                      items: {
                        type: "object",
                        required: ["label", "value"],
                        properties: {
                          label: { type: "string" },
                          value: { type: "string" },
                        },
                      },
                    },
                    helpText: { type: "string", optional: true },
                  },
                },
              },
              content: { type: "string", optional: true },
            },
          },
        },
        currentStep: { type: "number", optional: true, description: "Current step index" },
        orientation: { type: "string", enum: ["horizontal", "vertical"], optional: true, description: "Wizard orientation" },
        showStepIndicator: { type: "boolean", optional: true, description: "Show step indicator" },
        allowSkip: { type: "boolean", optional: true, description: "Allow skipping steps" },
        allowBack: { type: "boolean", optional: true, description: "Allow going back to previous steps" },
      },
    },
    chart: {
      required: ["templateType", "title", "chartType", "data"],
      properties: {
        chartType: { type: "string", enum: ["line", "bar", "pie", "area", "scatter", "radar", "mixed"], description: "Chart type" },
        data: {
          type: "object",
          description: "Chart data",
          required: ["labels", "datasets"],
          properties: {
            labels: { type: "array", items: { type: "string" } },
            datasets: {
              type: "array",
              items: {
                type: "object",
                required: ["label", "data"],
                properties: {
                  label: { type: "string" },
                  data: { type: "array", items: { type: "number" } },
                  backgroundColor: { type: "string", optional: true }, // Simplified from union
                  borderColor: { type: "string", optional: true }, // Simplified from union
                  type: { type: "string", optional: true },
                },
              },
            },
          },
        },
        options: {
          type: "object",
          optional: true,
          description: "Chart options",
          properties: {
            aspectRatio: { type: "number", optional: true },
            responsive: { type: "boolean", optional: true },
            maintainAspectRatio: { type: "boolean", optional: true },
            showLegend: { type: "boolean", optional: true },
            showTooltips: { type: "boolean", optional: true },
            showGrid: { type: "boolean", optional: true },
            stacked: { type: "boolean", optional: true },
          },
        },
        height: { type: "number", optional: true, description: "Chart height" },
        filters: {
          type: "array",
          optional: true,
          description: "Filter options",
          items: {
            type: "object",
            required: ["id", "label", "type"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              type: { type: "string", enum: ["select", "date", "range"] },
              options: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string" },
                    value: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    map: {
      required: ["templateType", "title", "center"],
      properties: {
        center: {
          type: "object",
          description: "Map center coordinates",
          required: ["lat", "lng"],
          properties: {
            lat: { type: "number" },
            lng: { type: "number" },
          },
        },
        zoom: { type: "number", optional: true, description: "Map zoom level" },
        markers: {
          type: "array",
          optional: true,
          description: "Map markers",
          items: {
            type: "object",
            required: ["id", "position"],
            properties: {
              id: { type: "string" },
              position: {
                type: "object",
                required: ["lat", "lng"],
                properties: {
                  lat: { type: "number" },
                  lng: { type: "number" },
                },
              },
              title: { type: "string", optional: true },
              description: { type: "string", optional: true },
              icon: { type: "string", optional: true },
              color: { type: "string", optional: true },
            },
          },
        },
        polygons: {
          type: "array",
          optional: true,
          description: "Map polygons",
          items: {
            type: "object",
            required: ["id", "paths"],
            properties: {
              id: { type: "string" },
              paths: {
                type: "array",
                items: {
                  type: "object",
                  required: ["lat", "lng"],
                  properties: {
                    lat: { type: "number" },
                    lng: { type: "number" },
                  },
                },
              },
              fillColor: { type: "string", optional: true },
              strokeColor: { type: "string", optional: true },
              title: { type: "string", optional: true },
            },
          },
        },
        showControls: { type: "boolean", optional: true, description: "Show map controls" },
        mapType: { type: "string", enum: ["roadmap", "satellite", "hybrid", "terrain"], optional: true, description: "Map type" },
        height: { type: "number", optional: true, description: "Map height" },
      },
    },
    kanban: {
      required: ["templateType", "title", "columns"],
      properties: {
        columns: {
          type: "array",
          description: "Kanban columns and cards",
          items: {
            type: "object",
            required: ["id", "title", "cards"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              color: { type: "string", optional: true },
              limit: { type: "number", optional: true },
              cards: {
                type: "array",
                items: {
                  type: "object",
                  required: ["id", "title"],
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string", optional: true },
                    labels: {
                      type: "array",
                      optional: true,
                      items: {
                        type: "object",
                        required: ["text", "color"],
                        properties: {
                          text: { type: "string" },
                          color: { type: "string" },
                        },
                      },
                    },
                    dueDate: { type: "string", optional: true },
                    assignees: {
                      type: "array",
                      optional: true,
                      items: {
                        type: "object",
                        required: ["name"],
                        properties: {
                          name: { type: "string" },
                          avatarUrl: { type: "string", optional: true },
                        },
                      },
                    },
                    attachments: { type: "number", optional: true },
                    comments: { type: "number", optional: true },
                    priority: { type: "string", enum: ["low", "medium", "high", "urgent"], optional: true },
                  },
                },
              },
            },
          },
        },
        allowDragDrop: { type: "boolean", optional: true, description: "Allow drag and drop" },
        collapsibleColumns: { type: "boolean", optional: true, description: "Allow collapsing columns" },
        filters: {
          type: "array",
          optional: true,
          description: "Filter options",
          items: {
            type: "object",
            required: ["id", "label", "type"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              type: { type: "string", enum: ["assignee", "label", "priority", "dueDate"] },
              options: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string" },
                    value: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    feed: {
      required: ["templateType", "title", "posts"],
      properties: {
        posts: {
          type: "array",
          description: "Feed posts",
          items: {
            type: "object",
            required: ["id", "author", "content", "timestamp"],
            properties: {
              id: { type: "string" },
              author: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  avatarUrl: { type: "string", optional: true },
                  title: { type: "string", optional: true },
                },
              },
              content: { type: "string" },
              timestamp: { type: "string" },
              media: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["type", "url"],
                  properties: {
                    type: { type: "string", enum: ["image", "video"] },
                    url: { type: "string" },
                    thumbnailUrl: { type: "string", optional: true },
                  },
                },
              },
              likes: { type: "number", optional: true },
              comments: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["id", "author", "content", "timestamp"],
                  properties: {
                    id: { type: "string" },
                    author: {
                      type: "object",
                      required: ["name"],
                      properties: {
                        name: { type: "string" },
                        avatarUrl: { type: "string", optional: true },
                      },
                    },
                    content: { type: "string" },
                    timestamp: { type: "string" },
                    likes: { type: "number", optional: true },
                  },
                },
              },
              tags: { type: "array", items: { type: "string" }, optional: true },
            },
          },
        },
        layout: { type: "string", enum: ["timeline", "grid", "compact"], optional: true, description: "Feed layout" },
        allowComments: { type: "boolean", optional: true, description: "Allow commenting" },
        allowLikes: { type: "boolean", optional: true, description: "Allow liking" },
        filters: {
          type: "array",
          optional: true,
          description: "Filter options",
          items: {
            type: "object",
            required: ["id", "label", "type"],
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              type: { type: "string", enum: ["author", "tag", "date"] },
              options: {
                type: "array",
                optional: true,
                items: {
                  type: "object",
                  required: ["label", "value"],
                  properties: {
                    label: { type: "string" },
                    value: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    timeline: {
      templateType: "timeline",
      title: "Project Milestones",
      events: [
        { id: "1", title: "Project Kick-off", date: "2024-01-15", description: "Initial meeting with stakeholders." },
        { id: "2", title: "Development Sprint 1", date: "2024-02-01", category: "Development", icon: "code" },
      ],
      layout: "vertical",
    },
    gallery: {
      templateType: "gallery",
      title: "Photo Gallery",
      items: [
        { id: "1", imageUrl: "/placeholder.svg?height=300&width=400", title: "Mountain View", description: "A beautiful mountain landscape." },
        { id: "2", imageUrl: "/placeholder.svg?height=300&width=400", title: "City Skyline", category: "Urban" },
      ],
      layout: "grid",
      lightbox: true,
    },
    pricing: {
      templateType: "pricing",
      title: "Subscription Plans",
      plans: [
        {
          id: "basic",
          name: "Basic",
          description: "For individuals",
          price: 10,
          features: [{ text: "Feature A" }, { text: "Feature B" }],
          cta: { text: "Choose Basic", action: "subscribe_basic" },
        },
        {
          id: "pro",
          name: "Pro",
          description: "For teams",
          price: 25,
          popular: true,
          features: [{ text: "All Basic Features" }, { text: "Feature C" }, { text: "Feature D" }],
          cta: { text: "Choose Pro", action: "subscribe_pro" },
        },
      ],
      currency: "USD",
      interval: "monthly",
    },
    stats: {
      templateType: "stats",
      title: "Key Performance Indicators",
      stats: [
        { id: "users", label: "Active Users", value: "1,500", change: 15, changeType: "increase", icon: "users" },
        { id: "sales", label: "Monthly Sales", value: "$25,000", description: "Target: $30,000", color: "green" },
      ],
      layout: "grid",
      columns: 2,
    },
    calendar: {
      templateType: "calendar",
      title: "Team Schedule",
      view: "week",
      events: [
        { id: "1", title: "Team Meeting", start: "2024-03-15T10:00:00", end: "2024-03-15T11:00:00", category: "Meetings", color: "blue" },
        { id: "2", title: "Project Deadline", start: "2024-03-18", allDay: true, category: "Deadlines", color: "red" },
      ],
      selectable: true,
    },
    wizard: {
      templateType: "wizard",
      title: "Onboarding Process",
      steps: [
        { id: "welcome", title: "Welcome", content: "Welcome to our platform!" },
        {
          id: "profile",
          title: "Profile Setup",
          fields: [
            { id: "name", type: "text", label: "Full Name", required: true },
            { id: "email", type: "email", label: "Email Address", placeholder: "you@example.com" },
          ],
        },
        { id: "finish", title: "Finish", description: "You're all set!" },
      ],
      orientation: "horizontal",
      currentStep: 0,
    },
    chart: {
      templateType: "chart",
      title: "Sales Over Time",
      chartType: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        datasets: [
          { label: "Product A Sales", data: [100, 120, 150, 130], borderColor: "blue" },
          { label: "Product B Sales", data: [80, 90, 110, 100], borderColor: "green" },
        ],
      },
      options: { showLegend: true, aspectRatio: 2 },
      height: 300,
    },
    map: {
      templateType: "map",
      title: "Store Locations",
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      zoom: 12,
      markers: [
        { id: "store1", position: { lat: 37.7749, lng: -122.4194 }, title: "Downtown Store", description: "Open 9am-5pm" },
        { id: "store2", position: { lat: 37.7599, lng: -122.4394 }, title: "Mission Store", icon: "custom_pin" },
      ],
      mapType: "roadmap",
    },
    kanban: {
      templateType: "kanban",
      title: "Project Tasks",
      columns: [
        {
          id: "todo",
          title: "To Do",
          cards: [
            { id: "task1", title: "Design new logo", description: "Create mockups for client review", priority: "high" },
            { id: "task2", title: "Develop homepage" },
          ],
        },
        {
          id: "inprogress",
          title: "In Progress",
          cards: [{ id: "task3", title: "Write documentation", assignees: [{ name: "Alice" }] }],
        },
        {
          id: "done",
          title: "Done",
          cards: [{ id: "task4", title: "Deploy to staging" }],
        },
      ],
      allowDragDrop: true,
    },
    feed: {
      templateType: "feed",
      title: "Company Updates",
      posts: [
        {
          id: "post1",
          author: { name: "Admin", avatarUrl: "/placeholder.svg?height=40&width=40" },
          content: "Welcome to the new platform! We're excited to share updates here.",
          timestamp: "2024-03-14T10:00:00Z",
          likes: 15,
        },
        {
          id: "post2",
          author: { name: "Marketing Team" },
          content: "Check out our latest blog post on new features!",
          timestamp: "2024-03-13T15:30:00Z",
          media: [{ type: "image", url: "/placeholder.svg?height=200&width=300" }],
          tags: ["announcement", "features"],
        },
      ],
      layout: "timeline",
      allowComments: true,
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
    timeline: {
      templateType: "timeline",
      title: "Project Milestones",
      events: [
        { id: "1", title: "Project Kick-off", date: "2024-01-15", description: "Initial meeting with stakeholders." },
        { id: "2", title: "Development Sprint 1", date: "2024-02-01", category: "Development", icon: "code" },
      ],
      layout: "vertical",
    },
    gallery: {
      templateType: "gallery",
      title: "Photo Gallery",
      items: [
        { id: "1", imageUrl: "/placeholder.svg?height=300&width=400", title: "Mountain View", description: "A beautiful mountain landscape." },
        { id: "2", imageUrl: "/placeholder.svg?height=300&width=400", title: "City Skyline", category: "Urban" },
      ],
      layout: "grid",
      lightbox: true,
    },
    pricing: {
      templateType: "pricing",
      title: "Subscription Plans",
      plans: [
        {
          id: "basic",
          name: "Basic",
          description: "For individuals",
          price: 10,
          features: [{ text: "Feature A" }, { text: "Feature B" }],
          cta: { text: "Choose Basic", action: "subscribe_basic" },
        },
        {
          id: "pro",
          name: "Pro",
          description: "For teams",
          price: 25,
          popular: true,
          features: [{ text: "All Basic Features" }, { text: "Feature C" }, { text: "Feature D" }],
          cta: { text: "Choose Pro", action: "subscribe_pro" },
        },
      ],
      currency: "USD",
      interval: "monthly",
    },
    stats: {
      templateType: "stats",
      title: "Key Performance Indicators",
      stats: [
        { id: "users", label: "Active Users", value: "1,500", change: 15, changeType: "increase", icon: "users" },
        { id: "sales", label: "Monthly Sales", value: "$25,000", description: "Target: $30,000", color: "green" },
      ],
      layout: "grid",
      columns: 2,
    },
    calendar: {
      templateType: "calendar",
      title: "Team Schedule",
      view: "week",
      events: [
        { id: "1", title: "Team Meeting", start: "2024-03-15T10:00:00", end: "2024-03-15T11:00:00", category: "Meetings", color: "blue" },
        { id: "2", title: "Project Deadline", start: "2024-03-18", allDay: true, category: "Deadlines", color: "red" },
      ],
      selectable: true,
    },
    wizard: {
      templateType: "wizard",
      title: "Onboarding Process",
      steps: [
        { id: "welcome", title: "Welcome", content: "Welcome to our platform!" },
        {
          id: "profile",
          title: "Profile Setup",
          fields: [
            { id: "name", type: "text", label: "Full Name", required: true },
            { id: "email", type: "email", label: "Email Address", placeholder: "you@example.com" },
          ],
        },
        { id: "finish", title: "Finish", description: "You're all set!" },
      ],
      orientation: "horizontal",
      currentStep: 0,
    },
    chart: {
      templateType: "chart",
      title: "Sales Over Time",
      chartType: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr"],
        datasets: [
          { label: "Product A Sales", data: [100, 120, 150, 130], borderColor: "blue" },
          { label: "Product B Sales", data: [80, 90, 110, 100], borderColor: "green" },
        ],
      },
      options: { showLegend: true, aspectRatio: 2 },
      height: 300,
    },
    map: {
      templateType: "map",
      title: "Store Locations",
      center: { lat: 37.7749, lng: -122.4194 }, // San Francisco
      zoom: 12,
      markers: [
        { id: "store1", position: { lat: 37.7749, lng: -122.4194 }, title: "Downtown Store", description: "Open 9am-5pm" },
        { id: "store2", position: { lat: 37.7599, lng: -122.4394 }, title: "Mission Store", icon: "custom_pin" },
      ],
      mapType: "roadmap",
    },
    kanban: {
      templateType: "kanban",
      title: "Project Tasks",
      columns: [
        {
          id: "todo",
          title: "To Do",
          cards: [
            { id: "task1", title: "Design new logo", description: "Create mockups for client review", priority: "high" },
            { id: "task2", title: "Develop homepage" },
          ],
        },
        {
          id: "inprogress",
          title: "In Progress",
          cards: [{ id: "task3", title: "Write documentation", assignees: [{ name: "Alice" }] }],
        },
        {
          id: "done",
          title: "Done",
          cards: [{ id: "task4", title: "Deploy to staging" }],
        },
      ],
      allowDragDrop: true,
    },
    feed: {
      templateType: "feed",
      title: "Company Updates",
      posts: [
        {
          id: "post1",
          author: { name: "Admin", avatarUrl: "/placeholder.svg?height=40&width=40" },
          content: "Welcome to the new platform! We're excited to share updates here.",
          timestamp: "2024-03-14T10:00:00Z",
          likes: 15,
        },
        {
          id: "post2",
          author: { name: "Marketing Team" },
          content: "Check out our latest blog post on new features!",
          timestamp: "2024-03-13T15:30:00Z",
          media: [{ type: "image", url: "/placeholder.svg?height=200&width=300" }],
          tags: ["announcement", "features"],
        },
      ],
      layout: "timeline",
      allowComments: true,
    },
  }

  return (
    examples[templateType] || {
      error: `Example not found for template type: ${templateType}`,
      availableTemplates: Object.keys(examples),
    }
  )
}
