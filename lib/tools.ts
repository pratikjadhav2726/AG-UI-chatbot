import { tool } from "ai"
import { z } from "zod"

// Base schema for all templates
const baseTemplateSchema = z.object({
  title: z.string().describe("Title of the template"),
  description: z.string().optional().describe("Description of the template"),
  theme: z.enum(["light", "dark", "system"]).optional().default("system").describe("Color theme"),
  primaryColor: z.string().optional().describe("Primary color (hex code)"),
  fullScreen: z.boolean().optional().default(false).describe("Whether to display in full screen"),
  closeButtonText: z.string().optional().default("Close").describe("Text for the close button"),
  actionButtonText: z.string().optional().describe("Text for the primary action button"),
})

// Dashboard template schema
const dashboardSchema = baseTemplateSchema.extend({
  templateType: z.literal("dashboard"),
  layout: z.enum(["grid", "columns", "rows"]).default("grid").describe("Layout style"),
  metrics: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        change: z.number().optional(),
        changeType: z.enum(["increase", "decrease", "neutral"]).optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .describe("Metrics to display"),
  charts: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(["line", "bar", "pie", "area"]),
        title: z.string(),
        data: z.any(),
        height: z.number().optional().default(200),
      }),
    )
    .optional()
    .describe("Charts to display"),
  recentActivity: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        timestamp: z.string(),
        icon: z.string().optional(),
      }),
    )
    .optional()
    .describe("Recent activity items"),
})

// Data table template schema
const dataTableSchema = baseTemplateSchema.extend({
  templateType: z.literal("dataTable"),
  columns: z
    .array(
      z.object({
        id: z.string(),
        header: z.string(),
        accessorKey: z.string(),
        enableSorting: z.boolean().optional().default(true),
        cell: z
          .object({
            type: z.enum(["text", "badge", "image", "actions"]),
            options: z.record(z.any()).optional(),
          })
          .optional(),
      }),
    )
    .describe("Table columns"),
  data: z.array(z.record(z.any())).describe("Table data"),
  pagination: z
    .object({
      enabled: z.boolean().default(true),
      pageSize: z.number().default(10),
      pageSizeOptions: z.array(z.number()).optional().default([5, 10, 20, 50]),
    })
    .optional()
    .describe("Pagination options"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["select", "text", "date", "boolean"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      }),
    )
    .optional()
    .describe("Filter options"),
})

// Product catalog template schema
const productCatalogSchema = baseTemplateSchema.extend({
  templateType: z.literal("productCatalog"),
  layout: z.enum(["grid", "list"]).default("grid").describe("Layout style"),
  products: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        currency: z.string().optional().default("USD"),
        imageUrl: z.string().optional(),
        rating: z.number().optional(),
        badges: z.array(z.string()).optional(),
        category: z.string().optional(),
        inStock: z.boolean().optional().default(true),
      }),
    )
    .describe("Products to display"),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional()
    .describe("Product categories"),
  sorting: z
    .object({
      enabled: z.boolean().default(true),
      options: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
    })
    .optional()
    .describe("Sorting options"),
})

// Profile card template schema
const profileCardSchema = baseTemplateSchema.extend({
  templateType: z.literal("profileCard"),
  profile: z
    .object({
      name: z.string(),
      title: z.string().optional(),
      company: z.string().optional(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      coverImageUrl: z.string().optional(),
      location: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      socialLinks: z
        .array(
          z.object({
            platform: z.string(),
            url: z.string(),
            icon: z.string().optional(),
          }),
        )
        .optional(),
      stats: z
        .array(
          z.object({
            label: z.string(),
            value: z.union([z.string(), z.number()]),
          }),
        )
        .optional(),
    })
    .describe("Profile information"),
  actions: z
    .array(
      z.object({
        label: z.string(),
        action: z.string(),
        variant: z.enum(["default", "outline", "ghost", "link"]).optional().default("default"),
        icon: z.string().optional(),
      }),
    )
    .optional()
    .describe("Action buttons"),
})

// Timeline template schema
const timelineSchema = baseTemplateSchema.extend({
  templateType: z.literal("timeline"),
  events: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        icon: z.string().optional(),
        category: z.string().optional(),
        color: z.string().optional(),
        media: z
          .object({
            type: z.enum(["image", "video"]),
            url: z.string(),
          })
          .optional(),
      }),
    )
    .describe("Timeline events"),
  layout: z.enum(["vertical", "horizontal"]).default("vertical").describe("Layout style"),
  groupByDate: z.boolean().optional().default(false).describe("Group events by date"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["category", "date"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      }),
    )
    .optional()
    .describe("Filter options"),
})

// Gallery template schema
const gallerySchema = baseTemplateSchema.extend({
  templateType: z.literal("gallery"),
  layout: z.enum(["grid", "masonry", "carousel"]).default("grid").describe("Layout style"),
  items: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string(),
        thumbnailUrl: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        date: z.string().optional(),
      }),
    )
    .describe("Gallery items"),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional()
    .describe("Item categories"),
  lightbox: z.boolean().optional().default(true).describe("Enable lightbox for images"),
  columns: z.number().optional().default(3).describe("Number of columns in grid layout"),
})

// Pricing template schema
const pricingSchema = baseTemplateSchema.extend({
  templateType: z.literal("pricing"),
  currency: z.string().default("USD").describe("Currency for pricing"),
  interval: z.enum(["monthly", "yearly", "one-time"]).default("monthly").describe("Billing interval"),
  showToggle: z.boolean().optional().default(false).describe("Show interval toggle"),
  plans: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        discountedPrice: z.number().optional(),
        interval: z.string().optional(),
        features: z.array(
          z.object({
            text: z.string(),
            included: z.boolean().default(true),
            icon: z.string().optional(),
          }),
        ),
        cta: z.object({
          text: z.string(),
          action: z.string(),
        }),
        popular: z.boolean().optional().default(false),
        color: z.string().optional(),
      }),
    )
    .describe("Pricing plans"),
  comparison: z.boolean().optional().default(false).describe("Show comparison table"),
})

// Stats template schema
const statsSchema = baseTemplateSchema.extend({
  templateType: z.literal("stats"),
  layout: z.enum(["grid", "list"]).default("grid").describe("Layout style"),
  stats: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        value: z.union([z.string(), z.number()]),
        description: z.string().optional(),
        change: z.number().optional(),
        changeType: z.enum(["increase", "decrease", "neutral"]).optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        chart: z
          .object({
            type: z.enum(["sparkline", "radial"]),
            data: z.array(z.number()),
          })
          .optional(),
      }),
    )
    .describe("Statistics to display"),
  columns: z.number().optional().default(3).describe("Number of columns in grid layout"),
})

// Calendar template schema
const calendarSchema = baseTemplateSchema.extend({
  templateType: z.literal("calendar"),
  view: z.enum(["month", "week", "day", "agenda"]).default("month").describe("Calendar view"),
  events: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        start: z.string(),
        end: z.string().optional(),
        allDay: z.boolean().optional().default(false),
        location: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .optional()
    .describe("Calendar events"),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
      }),
    )
    .optional()
    .describe("Event categories"),
  selectable: z.boolean().optional().default(false).describe("Allow date selection"),
  defaultDate: z.string().optional().describe("Default selected date"),
})

// Wizard template schema
const wizardSchema = baseTemplateSchema.extend({
  templateType: z.literal("wizard"),
  steps: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().optional(),
        fields: z
          .array(
            z.object({
              id: z.string(),
              type: z.enum([
                "text",
                "number",
                "email",
                "password",
                "textarea",
                "select",
                "checkbox",
                "radio",
                "date",
                "time",
                "file",
              ]),
              label: z.string(),
              placeholder: z.string().optional(),
              required: z.boolean().optional().default(false),
              options: z
                .array(
                  z.object({
                    label: z.string(),
                    value: z.string(),
                  }),
                )
                .optional(),
              helpText: z.string().optional(),
            }),
          )
          .optional(),
        content: z.string().optional(),
      }),
    )
    .describe("Wizard steps"),
  currentStep: z.number().optional().default(0).describe("Current step index"),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal").describe("Wizard orientation"),
  showStepIndicator: z.boolean().optional().default(true).describe("Show step indicator"),
  allowSkip: z.boolean().optional().default(false).describe("Allow skipping steps"),
  allowBack: z.boolean().optional().default(true).describe("Allow going back to previous steps"),
})

// Chart template schema
const chartSchema = baseTemplateSchema.extend({
  templateType: z.literal("chart"),
  chartType: z.enum(["line", "bar", "pie", "area", "scatter", "radar", "mixed"]).describe("Chart type"),
  data: z
    .object({
      labels: z.array(z.string()),
      datasets: z.array(
        z.object({
          label: z.string(),
          data: z.array(z.number()),
          backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
          borderColor: z.union([z.string(), z.array(z.string())]).optional(),
          type: z.string().optional(),
        }),
      ),
    })
    .describe("Chart data"),
  options: z
    .object({
      aspectRatio: z.number().optional(),
      responsive: z.boolean().optional().default(true),
      maintainAspectRatio: z.boolean().optional().default(false),
      showLegend: z.boolean().optional().default(true),
      showTooltips: z.boolean().optional().default(true),
      showGrid: z.boolean().optional().default(true),
      stacked: z.boolean().optional().default(false),
    })
    .optional()
    .describe("Chart options"),
  height: z.number().optional().default(400).describe("Chart height"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["select", "date", "range"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      }),
    )
    .optional()
    .describe("Filter options"),
})

// Map template schema
const mapSchema = baseTemplateSchema.extend({
  templateType: z.literal("map"),
  center: z
    .object({
      lat: z.number(),
      lng: z.number(),
    })
    .describe("Map center coordinates"),
  zoom: z.number().optional().default(10).describe("Map zoom level"),
  markers: z
    .array(
      z.object({
        id: z.string(),
        position: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        title: z.string().optional(),
        description: z.string().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
      }),
    )
    .optional()
    .describe("Map markers"),
  polygons: z
    .array(
      z.object({
        id: z.string(),
        paths: z.array(
          z.object({
            lat: z.number(),
            lng: z.number(),
          }),
        ),
        fillColor: z.string().optional(),
        strokeColor: z.string().optional(),
        title: z.string().optional(),
      }),
    )
    .optional()
    .describe("Map polygons"),
  showControls: z.boolean().optional().default(true).describe("Show map controls"),
  mapType: z.enum(["roadmap", "satellite", "hybrid", "terrain"]).optional().default("roadmap").describe("Map type"),
  height: z.number().optional().default(400).describe("Map height"),
})

// Kanban template schema
const kanbanSchema = baseTemplateSchema.extend({
  templateType: z.literal("kanban"),
  columns: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        color: z.string().optional(),
        limit: z.number().optional(),
        cards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().optional(),
            labels: z
              .array(
                z.object({
                  text: z.string(),
                  color: z.string(),
                }),
              )
              .optional(),
            dueDate: z.string().optional(),
            assignees: z
              .array(
                z.object({
                  name: z.string(),
                  avatarUrl: z.string().optional(),
                }),
              )
              .optional(),
            attachments: z.number().optional(),
            comments: z.number().optional(),
            priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
          }),
        ),
      }),
    )
    .describe("Kanban columns and cards"),
  allowDragDrop: z.boolean().optional().default(true).describe("Allow drag and drop"),
  collapsibleColumns: z.boolean().optional().default(false).describe("Allow collapsing columns"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["assignee", "label", "priority", "dueDate"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      }),
    )
    .optional()
    .describe("Filter options"),
})

// Feed template schema
const feedSchema = baseTemplateSchema.extend({
  templateType: z.literal("feed"),
  posts: z
    .array(
      z.object({
        id: z.string(),
        author: z.object({
          name: z.string(),
          avatarUrl: z.string().optional(),
          title: z.string().optional(),
        }),
        content: z.string(),
        timestamp: z.string(),
        media: z
          .array(
            z.object({
              type: z.enum(["image", "video"]),
              url: z.string(),
              thumbnailUrl: z.string().optional(),
            }),
          )
          .optional(),
        likes: z.number().optional().default(0),
        comments: z
          .array(
            z.object({
              id: z.string(),
              author: z.object({
                name: z.string(),
                avatarUrl: z.string().optional(),
              }),
              content: z.string(),
              timestamp: z.string(),
              likes: z.number().optional().default(0),
            }),
          )
          .optional(),
        tags: z.array(z.string()).optional(),
      }),
    )
    .describe("Feed posts"),
  layout: z.enum(["timeline", "grid", "compact"]).default("timeline").describe("Feed layout"),
  allowComments: z.boolean().optional().default(true).describe("Allow commenting"),
  allowLikes: z.boolean().optional().default(true).describe("Allow liking"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["author", "tag", "date"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      }),
    )
    .optional()
    .describe("Filter options"),
})

// Combine all template schemas
const templateSchema = z.discriminatedUnion("templateType", [
  dashboardSchema,
  dataTableSchema,
  productCatalogSchema,
  profileCardSchema,
  timelineSchema,
  gallerySchema,
  pricingSchema,
  statsSchema,
  calendarSchema,
  wizardSchema,
  chartSchema,
  mapSchema,
  kanbanSchema,
  feedSchema,
])

export const tools = {
  generateDynamicUI: tool({
    description: "Generate a dynamic UI template to display information or collect data from the user",
    parameters: templateSchema,
    execute: async (templateConfig) => {
      return templateConfig
    },
  }),
}
