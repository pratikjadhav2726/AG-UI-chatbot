import { tool } from "ai"
import { z } from "zod"

// Base schema for all templates
const baseTemplateSchema = z.object({
  title: z.string().describe("Title of the template"),
  description: z.string().nullable().describe("Description of the template"),
  theme: z.enum(["light", "dark", "system"]).nullable().default("system").describe("Color theme"),
  primaryColor: z.string().nullable().describe("Primary color (hex code)"),
  fullScreen: z.boolean().nullable().default(false).describe("Whether to display in full screen"),
  closeButtonText: z.string().nullable().default("Close").describe("Text for the close button"),
  actionButtonText: z.string().nullable().describe("Text for the primary action button"),
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
        change: z.number().nullable(),
        changeType: z.enum(["increase", "decrease", "neutral"]).nullable(),
        icon: z.string().nullable(),
        color: z.string().nullable(),
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
        height: z.number().nullable().default(200),
      }),
    )
    .nullable()
    .describe("Charts to display"),
  recentActivity: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        timestamp: z.string(),
        icon: z.string().nullable(),
      }),
    )
    .nullable()
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
        enableSorting: z.boolean().nullable().default(true),
        cell: z
          .object({
            type: z.enum(["text", "badge", "image", "actions"]),
            options: z.record(z.any()).nullable(),
          })
          .nullable(),
      }),
    )
    .describe("Table columns"),
  data: z.array(z.record(z.any())).describe("Table data"),
  pagination: z
    .object({
      enabled: z.boolean().default(true),
      pageSize: z.number().default(10),
      pageSizeOptions: z.array(z.number()).nullable().default([5, 10, 20, 50]),
    })
    .nullable()
    .describe("Pagination options"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["select", "text", "date", "boolean"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).nullable(),
      }),
    )
    .nullable()
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
        currency: z.string().nullable().default("USD"),
        imageUrl: z.string().nullable(),
        rating: z.number().nullable(),
        badges: z.array(z.string()).nullable(),
        category: z.string().nullable(),
        inStock: z.boolean().nullable().default(true),
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
    .nullable()
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
        .nullable(),
    })
    .nullable()
    .describe("Sorting options"),
})

// Profile card template schema
const profileCardSchema = baseTemplateSchema.extend({
  templateType: z.literal("profileCard"),
  profile: z
    .object({
      name: z.string(),
      title: z.string().nullable(),
      company: z.string().nullable(),
      bio: z.string().nullable(),
      avatarUrl: z.string().nullable(),
      coverImageUrl: z.string().nullable(),
      location: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      website: z.string().nullable(),
      socialLinks: z
        .array(
          z.object({
            platform: z.string(),
            url: z.string(),
            icon: z.string().nullable(),
          }),
        )
        .nullable(),
      stats: z
        .array(
          z.object({
            label: z.string(),
            value: z.union([z.string(), z.number()]),
          }),
        )
        .nullable(),
    })
    .describe("Profile information"),
  actions: z
    .array(
      z.object({
        label: z.string(),
        action: z.string(),
        variant: z.enum(["default", "outline", "ghost", "link"]).nullable().default("default"),
        icon: z.string().nullable(),
      }),
    )
    .nullable()
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
        description: z.string().nullable(),
        date: z.string(),
        icon: z.string().nullable(),
        category: z.string().nullable(),
        color: z.string().nullable(),
        media: z
          .object({
            type: z.enum(["image", "video"]),
            url: z.string(),
          })
          .nullable(),
      }),
    )
    .describe("Timeline events"),
  layout: z.enum(["vertical", "horizontal"]).default("vertical").describe("Layout style"),
  groupByDate: z.boolean().nullable().default(false).describe("Group events by date"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["category", "date"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).nullable(),
      }),
    )
    .nullable()
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
        title: z.string().nullable(),
        description: z.string().nullable(),
        imageUrl: z.string(),
        thumbnailUrl: z.string().nullable(),
        category: z.string().nullable(),
        tags: z.array(z.string()).nullable(),
        date: z.string().nullable(),
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
    .nullable()
    .describe("Item categories"),
  lightbox: z.boolean().nullable().default(true).describe("Enable lightbox for images"),
  columns: z.number().nullable().default(3).describe("Number of columns in grid layout"),
})

// Pricing template schema
const pricingSchema = baseTemplateSchema.extend({
  templateType: z.literal("pricing"),
  currency: z.string().default("USD").describe("Currency for pricing"),
  interval: z.enum(["monthly", "yearly", "one-time"]).default("monthly").describe("Billing interval"),
  showToggle: z.boolean().nullable().default(false).describe("Show interval toggle"),
  plans: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        discountedPrice: z.number().nullable(),
        interval: z.string().nullable(),
        features: z.array(
          z.object({
            text: z.string(),
            included: z.boolean().default(true),
            icon: z.string().nullable(),
          }),
        ),
        cta: z.object({
          text: z.string(),
          action: z.string(),
        }),
        popular: z.boolean().nullable().default(false),
        color: z.string().nullable(),
      }),
    )
    .describe("Pricing plans"),
  comparison: z.boolean().nullable().default(false).describe("Show comparison table"),
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
        description: z.string().nullable(),
        change: z.number().nullable(),
        changeType: z.enum(["increase", "decrease", "neutral"]).nullable(),
        icon: z.string().nullable(),
        color: z.string().nullable(),
        chart: z
          .object({
            type: z.enum(["sparkline", "radial"]),
            data: z.array(z.number()),
          })
          .nullable(),
      }),
    )
    .describe("Statistics to display"),
  columns: z.number().nullable().default(3).describe("Number of columns in grid layout"),
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
        end: z.string().nullable(),
        allDay: z.boolean().nullable().default(false),
        location: z.string().nullable(),
        description: z.string().nullable(),
        category: z.string().nullable(),
        color: z.string().nullable(),
      }),
    )
    .nullable()
    .describe("Calendar events"),
  categories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
      }),
    )
    .nullable()
    .describe("Event categories"),
  selectable: z.boolean().nullable().default(false).describe("Allow date selection"),
  defaultDate: z.string().nullable().describe("Default selected date"),
})

// Wizard template schema
const wizardSchema = baseTemplateSchema.extend({
  templateType: z.literal("wizard"),
  steps: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
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
              placeholder: z.string().nullable(),
              required: z.boolean().nullable().default(false),
              options: z
                .array(
                  z.object({
                    label: z.string(),
                    value: z.string(),
                  }),
                )
                .nullable(),
              helpText: z.string().nullable(),
            }),
          )
          .nullable(),
        content: z.string().nullable(),
      }),
    )
    .describe("Wizard steps"),
  currentStep: z.number().nullable().default(0).describe("Current step index"),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal").describe("Wizard orientation"),
  showStepIndicator: z.boolean().nullable().default(true).describe("Show step indicator"),
  allowSkip: z.boolean().nullable().default(false).describe("Allow skipping steps"),
  allowBack: z.boolean().nullable().default(true).describe("Allow going back to previous steps"),
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
          backgroundColor: z.union([z.string(), z.array(z.string())]).nullable(),
          borderColor: z.union([z.string(), z.array(z.string())]).nullable(),
          type: z.string().nullable(),
        }),
      ),
    })
    .describe("Chart data"),
  options: z
    .object({
      aspectRatio: z.number().nullable(),
      responsive: z.boolean().nullable().default(true),
      maintainAspectRatio: z.boolean().nullable().default(false),
      showLegend: z.boolean().nullable().default(true),
      showTooltips: z.boolean().nullable().default(true),
      showGrid: z.boolean().nullable().default(true),
      stacked: z.boolean().nullable().default(false),
    })
    .nullable()
    .describe("Chart options"),
  height: z.number().nullable().default(400).describe("Chart height"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["select", "date", "range"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).nullable(),
      }),
    )
    .nullable()
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
  zoom: z.number().nullable().default(10).describe("Map zoom level"),
  markers: z
    .array(
      z.object({
        id: z.string(),
        position: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
        title: z.string().nullable(),
        description: z.string().nullable(),
        icon: z.string().nullable(),
        color: z.string().nullable(),
      }),
    )
    .nullable()
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
        fillColor: z.string().nullable(),
        strokeColor: z.string().nullable(),
        title: z.string().nullable(),
      }),
    )
    .nullable()
    .describe("Map polygons"),
  showControls: z.boolean().nullable().default(true).describe("Show map controls"),
  mapType: z.enum(["roadmap", "satellite", "hybrid", "terrain"]).nullable().default("roadmap").describe("Map type"),
  height: z.number().nullable().default(400).describe("Map height"),
})

// Kanban template schema
const kanbanSchema = baseTemplateSchema.extend({
  templateType: z.literal("kanban"),
  columns: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        color: z.string().nullable(),
        limit: z.number().nullable(),
        cards: z.array(
          z.object({
            id: z.string(),
            title: z.string(),
            description: z.string().nullable(),
            labels: z
              .array(
                z.object({
                  text: z.string(),
                  color: z.string(),
                }),
              )
              .nullable(),
            dueDate: z.string().nullable(),
            assignees: z
              .array(
                z.object({
                  name: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
              )
              .nullable(),
            attachments: z.number().nullable(),
            comments: z.number().nullable(),
            priority: z.enum(["low", "medium", "high", "urgent"]).nullable(),
          }),
        ),
      }),
    )
    .describe("Kanban columns and cards"),
  allowDragDrop: z.boolean().nullable().default(true).describe("Allow drag and drop"),
  collapsibleColumns: z.boolean().nullable().default(false).describe("Allow collapsing columns"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["assignee", "label", "priority", "dueDate"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).nullable(),
      }),
    )
    .nullable()
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
          avatarUrl: z.string().nullable(),
          title: z.string().nullable(),
        }),
        content: z.string(),
        timestamp: z.string(),
        media: z
          .array(
            z.object({
              type: z.enum(["image", "video"]),
              url: z.string(),
              thumbnailUrl: z.string().nullable(),
            }),
          )
          .nullable(),
        likes: z.number().nullable().default(0),
        comments: z
          .array(
            z.object({
              id: z.string(),
              author: z.object({
                name: z.string(),
                avatarUrl: z.string().nullable(),
              }),
              content: z.string(),
              timestamp: z.string(),
              likes: z.number().nullable().default(0),
            }),
          )
          .nullable(),
        tags: z.array(z.string()).nullable(),
      }),
    )
    .describe("Feed posts"),
  layout: z.enum(["timeline", "grid", "compact"]).default("timeline").describe("Feed layout"),
  allowComments: z.boolean().nullable().default(true).describe("Allow commenting"),
  allowLikes: z.boolean().nullable().default(true).describe("Allow liking"),
  filters: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        type: z.enum(["author", "tag", "date"]),
        options: z.array(z.object({ label: z.string(), value: z.string() })).nullable(),
      }),
    )
    .nullable()
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

export const toolss = {
  generateDynamicUI: tool({
    description: "Generate a dynamic UI template to display information or collect data from the user",
    parameters: dataTableSchema,
    execute: async (templateConfig) => {
      return templateConfig
    },
  }),
}
