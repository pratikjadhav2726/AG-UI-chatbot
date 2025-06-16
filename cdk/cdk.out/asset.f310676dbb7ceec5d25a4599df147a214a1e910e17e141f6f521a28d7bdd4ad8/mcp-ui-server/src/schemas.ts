import { z } from "zod";

// Enhanced base template schema for dynamic content
export const BaseTemplateSchema = z.object({
  templateType: z.string(),
  title: z.string(),
  description: z.string().optional(),
  theme: z.enum(["light", "dark", "system"]).optional().default("system"),
  primaryColor: z.string().optional(),
  fullScreen: z.boolean().optional().default(false),
  closeButtonText: z.string().optional().default("Close"),
  actionButtonText: z.string().optional(),
  // Dynamic content fields that LLM can customize
  customData: z.record(z.any()).optional(), // For any additional dynamic data
  images: z.array(z.object({
    id: z.string(),
    url: z.string(),
    alt: z.string().optional(),
    caption: z.string().optional(),
    category: z.string().optional()
  })).optional(), // Dynamic image collection
  textContent: z.record(z.string()).optional(), // Dynamic text content
  brandingConfig: z.object({
    logoUrl: z.string().optional(),
    brandName: z.string().optional(),
    brandColors: z.array(z.string()).optional(),
    fontFamily: z.string().optional()
  }).optional()
});

// Enhanced Dashboard template schema with dynamic content
export const DashboardSchema = BaseTemplateSchema.extend({
  templateType: z.literal("dashboard"),
  layout: z.enum(["grid", "columns", "rows"]).default("grid"),
  metrics: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    change: z.number().optional(),
    changeType: z.enum(["increase", "decrease", "neutral"]).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    description: z.string().optional(),
    target: z.number().optional(), // Target value for progress
    unit: z.string().optional(), // e.g., "%", "$", "users"
    trendData: z.array(z.number()).optional() // Mini trend chart data
  })),
  charts: z.array(z.object({
    id: z.string(),
    type: z.enum(["line", "bar", "pie", "area", "scatter", "radar"]),
    title: z.string(),
    description: z.string().optional(),
    data: z.any(),
    height: z.number().optional().default(200),
    colors: z.array(z.string()).optional(),
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    showLegend: z.boolean().optional().default(true),
    gridLines: z.boolean().optional().default(true)
  })).optional(),
  recentActivity: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    timestamp: z.string(),
    icon: z.string().optional(),
    imageUrl: z.string().optional(), // User avatar or related image
    category: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
    actionUrl: z.string().optional()
  })).optional(),
  widgets: z.array(z.object({
    id: z.string(),
    type: z.enum(["metric", "chart", "list", "image", "text", "progress"]),
    title: z.string(),
    content: z.any(), // Dynamic widget content
    size: z.enum(["small", "medium", "large"]).optional().default("medium"),
    position: z.object({ x: z.number(), y: z.number() }).optional()
  })).optional(),
  navigation: z.array(z.object({
    label: z.string(),
    icon: z.string().optional(),
    action: z.string(),
    badge: z.string().optional()
  })).optional()
});

// Data Table template schema
export const DataTableSchema = BaseTemplateSchema.extend({
  templateType: z.literal("dataTable"),
  columns: z.array(z.object({
    id: z.string(),
    header: z.string(),
    accessorKey: z.string(),
    enableSorting: z.boolean().optional().default(true),
    cell: z.object({
      type: z.enum(["text", "badge", "image", "actions"]),
      options: z.record(z.any()).optional()
    }).optional()
  })),
  data: z.array(z.record(z.any())),
  pagination: z.object({
    enabled: z.boolean().default(true),
    pageSize: z.number().default(10),
    pageSizeOptions: z.array(z.number()).optional().default([5, 10, 20, 50])
  }).optional(),
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["select", "text", "date", "boolean"]),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional()
  })).optional()
});

// Enhanced Product Catalog template schema with dynamic content
export const ProductCatalogSchema = BaseTemplateSchema.extend({
  templateType: z.literal("productCatalog"),
  layout: z.enum(["grid", "list"]).default("grid"),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    currency: z.string().optional().default("USD"),
    imageUrl: z.string().optional(),
    images: z.array(z.string()).optional(), // Multiple product images
    rating: z.number().optional(),
    reviewCount: z.number().optional(),
    badges: z.array(z.string()).optional(),
    category: z.string().optional(),
    inStock: z.boolean().optional().default(true),
    discount: z.number().optional(), // Percentage discount
    specifications: z.record(z.string()).optional(), // Dynamic product specs
    vendor: z.string().optional(),
    sku: z.string().optional(),
    tags: z.array(z.string()).optional(),
    availability: z.string().optional(),
    shippingInfo: z.string().optional()
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().optional(),
    description: z.string().optional()
  })).optional(),
  sorting: z.object({
    enabled: z.boolean().default(true),
    options: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional()
  }).optional(),
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["select", "range", "checkbox", "color"]),
    options: z.array(z.object({ 
      label: z.string(), 
      value: z.string(),
      imageUrl: z.string().optional() 
    })).optional(),
    min: z.number().optional(),
    max: z.number().optional()
  })).optional(),
  heroSection: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    backgroundImageUrl: z.string().optional(),
    ctaText: z.string().optional(),
    ctaAction: z.string().optional()
  }).optional()
});

// Profile Card template schema
export const ProfileCardSchema = BaseTemplateSchema.extend({
  templateType: z.literal("profileCard"),
  profile: z.object({
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
    socialLinks: z.array(z.object({
      platform: z.string(),
      url: z.string(),
      icon: z.string().optional()
    })).optional(),
    stats: z.array(z.object({
      label: z.string(),
      value: z.union([z.string(), z.number()])
    })).optional()
  }),
  actions: z.array(z.object({
    label: z.string(),
    action: z.string(),
    variant: z.enum(["default", "outline", "ghost", "link"]).optional().default("default"),
    icon: z.string().optional()
  })).optional()
});

// Timeline template schema
export const TimelineSchema = BaseTemplateSchema.extend({
  templateType: z.literal("timeline"),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    icon: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional(),
    media: z.object({
      type: z.enum(["image", "video"]),
      url: z.string()
    }).optional()
  })),
  layout: z.enum(["vertical", "horizontal"]).default("vertical"),
  groupByDate: z.boolean().optional().default(false),
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["category", "date"]),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional()
  })).optional()
});

// Enhanced Gallery template schema with dynamic content
export const GallerySchema = BaseTemplateSchema.extend({
  templateType: z.literal("gallery"),
  layout: z.enum(["grid", "masonry", "carousel", "slider", "mosaic"]).default("grid"),
  items: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string(),
    thumbnailUrl: z.string().optional(),
    highResUrl: z.string().optional(), // For lightbox
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    date: z.string().optional(),
    author: z.string().optional(),
    location: z.string().optional(),
    dimensions: z.object({
      width: z.number(),
      height: z.number()
    }).optional(),
    metadata: z.record(z.string()).optional(), // EXIF or other metadata
    likes: z.number().optional(),
    views: z.number().optional(),
    downloadUrl: z.string().optional(),
    socialShare: z.boolean().optional().default(false)
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    imageUrl: z.string().optional(),
    description: z.string().optional(),
    count: z.number().optional()
  })).optional(),
  lightbox: z.boolean().optional().default(true),
  columns: z.number().optional().default(3),
  aspectRatio: z.string().optional(), // "16:9", "1:1", "auto"
  spacing: z.number().optional().default(4),
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["category", "tag", "date", "author"]),
    options: z.array(z.object({ 
      label: z.string(), 
      value: z.string(),
      count: z.number().optional() 
    })).optional()
  })).optional(),
  sortOptions: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional().default([
    { label: "Date", value: "date" },
    { label: "Title", value: "title" },
    { label: "Popular", value: "likes" }
  ])
});

// Pricing template schema
export const PricingSchema = BaseTemplateSchema.extend({
  templateType: z.literal("pricing"),
  currency: z.string().optional().default("USD"),
  interval: z.enum(["monthly", "yearly", "one-time"]).optional().default("monthly"),
  showToggle: z.boolean().optional().default(false),
  plans: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    discountedPrice: z.number().optional(),
    interval: z.string().optional(),
    features: z.array(z.object({
      text: z.string(),
      included: z.boolean().optional().default(true),
      icon: z.string().optional()
    })),
    cta: z.object({
      text: z.string(),
      action: z.string()
    }),
    popular: z.boolean().optional().default(false),
    color: z.string().optional()
  })),
  comparison: z.boolean().optional().default(false)
});

// Stats template schema
export const StatsSchema = BaseTemplateSchema.extend({
  templateType: z.literal("stats"),
  layout: z.enum(["grid", "list"]).default("grid"),
  stats: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    description: z.string().optional(),
    change: z.number().optional(),
    changeType: z.enum(["increase", "decrease", "neutral"]).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    chart: z.object({
      type: z.enum(["sparkline", "radial"]),
      data: z.array(z.number())
    }).optional()
  })),
  columns: z.number().optional().default(3)
});

// Calendar template schema
export const CalendarSchema = BaseTemplateSchema.extend({
  templateType: z.literal("calendar"),
  view: z.enum(["month", "week", "day", "agenda"]).default("month"),
  events: z.array(z.object({
    id: z.string(),
    title: z.string(),
    start: z.string(),
    end: z.string().optional(),
    allDay: z.boolean().optional().default(false),
    location: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    color: z.string().optional()
  })).optional(),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    color: z.string()
  })).optional(),
  selectable: z.boolean().optional().default(false),
  defaultDate: z.string().optional()
});

// Wizard template schema
export const WizardSchema = BaseTemplateSchema.extend({
  templateType: z.literal("wizard"),
  steps: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum([
        "text", "number", "email", "password", "textarea", "select", 
        "checkbox", "radio", "date", "time", "file"
      ]),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean().optional().default(false),
      options: z.array(z.object({
        label: z.string(),
        value: z.string()
      })).optional(),
      helpText: z.string().optional()
    })).optional(),
    content: z.string().optional()
  })),
  currentStep: z.number().optional().default(0),
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),
  showStepIndicator: z.boolean().optional().default(true),
  allowSkip: z.boolean().optional().default(false),
  allowBack: z.boolean().optional().default(true)
});

// Chart template schema
export const ChartSchema = BaseTemplateSchema.extend({
  templateType: z.literal("chart"),
  chartType: z.enum(["line", "bar", "pie", "area", "scatter", "radar", "mixed"]),
  data: z.object({
    labels: z.array(z.string()),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
      borderColor: z.union([z.string(), z.array(z.string())]).optional(),
      type: z.string().optional()
    }))
  }),
  options: z.object({
    aspectRatio: z.number().optional(),
    responsive: z.boolean().optional().default(true),
    maintainAspectRatio: z.boolean().optional().default(true),
    showLegend: z.boolean().optional().default(true),
    showTooltips: z.boolean().optional().default(true),
    showGrid: z.boolean().optional().default(true),
    stacked: z.boolean().optional().default(false)
  }).optional(),
  height: z.number().optional().default(400),
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["select", "date", "range"]),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional()
  })).optional()
});

// Map template schema
export const MapSchema = BaseTemplateSchema.extend({
  templateType: z.literal("map"),
  center: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  zoom: z.number().optional().default(10),
  markers: z.array(z.object({
    id: z.string(),
    position: z.object({
      lat: z.number(),
      lng: z.number()
    }),
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().optional()
  })).optional(),
  polygons: z.array(z.object({
    id: z.string(),
    paths: z.array(z.object({
      lat: z.number(),
      lng: z.number()
    })),
    fillColor: z.string().optional(),
    strokeColor: z.string().optional(),
    title: z.string().optional()
  })).optional(),
  showControls: z.boolean().optional().default(true),
  mapType: z.enum(["roadmap", "satellite", "hybrid", "terrain"]).optional().default("roadmap"),
  height: z.number().optional().default(400)
});

// Kanban template schema
export const KanbanSchema = BaseTemplateSchema.extend({
  templateType: z.literal("kanban"),
  columns: z.array(z.object({
    id: z.string(),
    title: z.string(),
    color: z.string().optional(),
    limit: z.number().optional(),
    cards: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      labels: z.array(z.object({
        text: z.string(),
        color: z.string()
      })).optional(),
      dueDate: z.string().optional(),
      assignees: z.array(z.object({
        name: z.string(),
        avatarUrl: z.string().optional()
      })).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      attachments: z.number().optional().default(0),
      comments: z.number().optional().default(0)
    }))
  })),
  allowDragAndDrop: z.boolean().optional().default(true),
  showCardCount: z.boolean().optional().default(true)
});

// Feed template schema
export const FeedSchema = BaseTemplateSchema.extend({
  templateType: z.literal("feed"),
  posts: z.array(z.object({
    id: z.string(),
    author: z.object({
      name: z.string(),
      avatarUrl: z.string().optional(),
      title: z.string().optional()
    }),
    content: z.string(),
    timestamp: z.string(),
    media: z.array(z.object({
      type: z.enum(["image", "video"]),
      url: z.string(),
      thumbnailUrl: z.string().optional()
    })).optional(),
    likes: z.number().optional().default(0),
    comments: z.array(z.object({
      id: z.string(),
      author: z.object({
        name: z.string(),
        avatarUrl: z.string().optional()
      }),
      content: z.string(),
      timestamp: z.string(),
      likes: z.number().optional().default(0)
    })).optional(),
    tags: z.array(z.string()).optional()
  })),
  layout: z.enum(["timeline", "grid", "compact"]).default("timeline"),
  allowComments: z.boolean().optional().default(true),
  allowLikes: z.boolean().optional().default(true),
  showTimestamps: z.boolean().optional().default(true)
});

// Enhanced Form template schema with dynamic content
export const FormSchema = BaseTemplateSchema.extend({
  templateType: z.literal("form"),
  formStyle: z.enum(["modern", "classic", "minimal", "card"]).optional().default("modern"),
  headerImage: z.string().optional(), // Header/banner image for the form
  sections: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    columns: z.number().optional().default(1),
    backgroundImage: z.string().optional(),
    collapsed: z.boolean().optional().default(false),
    fields: z.array(z.object({
      id: z.string(),
      type: z.enum([
        "text", "number", "email", "password", "textarea", "select", 
        "checkbox", "radio", "date", "time", "file", "phone", "url", "color",
        "range", "toggle", "rating", "signature", "rich-text", "image-upload"
      ]),
      label: z.string(),
      placeholder: z.string().optional(),
      description: z.string().optional(),
      required: z.boolean().optional().default(false),
      disabled: z.boolean().optional().default(false),
      validation: z.object({
        pattern: z.string().optional(),
        min: z.number().optional(),
        max: z.number().optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
        customMessage: z.string().optional()
      }).optional(),
      options: z.array(z.object({
        label: z.string(),
        value: z.string(),
        icon: z.string().optional(),
        imageUrl: z.string().optional(),
        description: z.string().optional()
      })).optional(),
      helpText: z.string().optional(),
      defaultValue: z.any().optional(),
      conditional: z.object({
        dependsOn: z.string(), // field ID
        showWhen: z.string(), // value to show this field
        operator: z.enum(["equals", "not-equals", "contains"]).optional().default("equals")
      }).optional(),
      styling: z.object({
        width: z.enum(["full", "half", "third", "quarter"]).optional().default("full"),
        backgroundColor: z.string().optional(),
        borderColor: z.string().optional()
      }).optional()
    }))
  })),
  submitButtonText: z.string().optional().default("Submit"),
  cancelButtonText: z.string().optional().default("Cancel"),
  resetButtonText: z.string().optional(),
  showProgress: z.boolean().optional().default(false),
  progressType: z.enum(["bar", "steps", "percentage"]).optional().default("bar"),
  submitAction: z.object({
    type: z.enum(["api", "email", "redirect"]),
    endpoint: z.string().optional(),
    successMessage: z.string().optional(),
    errorMessage: z.string().optional(),
    redirectUrl: z.string().optional()
  }).optional(),
  footer: z.object({
    text: z.string().optional(),
    links: z.array(z.object({
      text: z.string(),
      url: z.string()
    })).optional()
  }).optional(),
  branding: z.object({
    logoUrl: z.string().optional(),
    companyName: z.string().optional(),
    contactInfo: z.string().optional()
  }).optional()
});

// New template schemas for extended functionality

// Marketplace template schema
export const MarketplaceSchema = BaseTemplateSchema.extend({
  templateType: z.literal("marketplace"),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    currency: z.string().optional().default("USD"),
    imageUrl: z.string().optional(),
    seller: z.object({
      name: z.string(),
      avatarUrl: z.string().optional(),
      rating: z.number().optional(),
      verified: z.boolean().optional().default(false)
    }),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional().default(0),
    featured: z.boolean().optional().default(false),
    condition: z.enum(["new", "like-new", "good", "fair", "poor"]).optional(),
    location: z.string().optional(),
    shipping: z.object({
      available: z.boolean().default(true),
      cost: z.number().optional(),
      timeframe: z.string().optional()
    }).optional()
  })),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().optional()
  })),
  filters: z.array(z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(["select", "range", "checkbox", "location"]),
    options: z.array(z.object({ label: z.string(), value: z.string() })).optional()
  })).optional(),
  sorting: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional().default([
    { label: "Relevance", value: "relevance" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Newest", value: "newest" }
  ]),
  layout: z.enum(["grid", "list"]).default("grid")
});

// Analytics template schema
export const AnalyticsSchema = BaseTemplateSchema.extend({
  templateType: z.literal("analytics"),
  timeRange: z.object({
    start: z.string(),
    end: z.string(),
    presets: z.array(z.object({
      label: z.string(),
      value: z.string()
    })).optional().default([
      { label: "Last 7 days", value: "7d" },
      { label: "Last 30 days", value: "30d" },
      { label: "Last 90 days", value: "90d" }
    ])
  }),
  kpis: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    change: z.number().optional(),
    changeType: z.enum(["increase", "decrease", "neutral"]).optional(),
    target: z.number().optional(),
    format: z.enum(["number", "percentage", "currency", "duration"]).optional().default("number"),
    icon: z.string().optional()
  })),
  charts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["line", "bar", "pie", "area", "funnel", "heatmap"]),
    data: z.any(),
    insights: z.array(z.string()).optional(),
    height: z.number().optional().default(300)
  })),
  segments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    criteria: z.string(),
    size: z.number(),
    growth: z.number().optional()
  })).optional(),
  goals: z.array(z.object({
    id: z.string(),
    name: z.string(),
    target: z.number(),
    current: z.number(),
    deadline: z.string().optional(),
    status: z.enum(["on-track", "at-risk", "behind"]).optional()
  })).optional()
});

// E-commerce template schema
export const EcommerceSchema = BaseTemplateSchema.extend({
  templateType: z.literal("ecommerce"),
  products: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    originalPrice: z.number().optional(),
    currency: z.string().optional().default("USD"),
    images: z.array(z.string()),
    category: z.string(),
    brand: z.string().optional(),
    sku: z.string().optional(),
    stock: z.number().optional(),
    rating: z.number().optional(),
    reviewCount: z.number().optional().default(0),
    variants: z.array(z.object({
      id: z.string(),
      name: z.string(),
      options: z.array(z.object({
        name: z.string(),
        value: z.string(),
        price: z.number().optional()
      }))
    })).optional(),
    specifications: z.record(z.string()).optional(),
    shipping: z.object({
      weight: z.number().optional(),
      dimensions: z.object({
        length: z.number(),
        width: z.number(),
        height: z.number()
      }).optional(),
      freeShipping: z.boolean().optional().default(false)
    }).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
    onSale: z.boolean().optional().default(false)
  })),
  cart: z.object({
    enabled: z.boolean().default(true),
    showQuantity: z.boolean().default(true),
    showTotal: z.boolean().default(true)
  }).optional(),
  wishlist: z.object({
    enabled: z.boolean().default(true)
  }).optional(),
  comparison: z.object({
    enabled: z.boolean().default(true),
    maxItems: z.number().default(3)
  }).optional(),
  reviews: z.object({
    enabled: z.boolean().default(true),
    allowRating: z.boolean().default(true),
    allowPhotos: z.boolean().default(true)
  }).optional()
});

// Blog template schema
export const BlogSchema = BaseTemplateSchema.extend({
  templateType: z.literal("blog"),
  posts: z.array(z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().optional(),
    content: z.string(),
    featuredImage: z.string().optional(),
    author: z.object({
      name: z.string(),
      bio: z.string().optional(),
      avatarUrl: z.string().optional(),
      socialLinks: z.array(z.object({
        platform: z.string(),
        url: z.string()
      })).optional()
    }),
    publishedAt: z.string(),
    updatedAt: z.string().optional(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    readingTime: z.number().optional(),
    featured: z.boolean().optional().default(false),
    status: z.enum(["published", "draft", "scheduled"]).optional().default("published"),
    seo: z.object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional()
    }).optional()
  })),
  layout: z.enum(["grid", "list", "magazine"]).default("grid"),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    color: z.string().optional()
  })),
  sidebar: z.object({
    enabled: z.boolean().default(true),
    widgets: z.array(z.enum([
      "recent-posts", "categories", "tags", "search", 
      "newsletter", "social-links", "about"
    ])).optional()
  }).optional(),
  pagination: z.object({
    enabled: z.boolean().default(true),
    postsPerPage: z.number().default(10)
  }).optional(),
  comments: z.object({
    enabled: z.boolean().default(true),
    provider: z.enum(["built-in", "disqus", "facebook"]).optional().default("built-in")
  }).optional()
});

// Portfolio template schema
export const PortfolioSchema = BaseTemplateSchema.extend({
  templateType: z.literal("portfolio"),
  projects: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    longDescription: z.string().optional(),
    images: z.array(z.string()),
    thumbnailUrl: z.string().optional(),
    projectUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    category: z.string(),
    technologies: z.array(z.string()),
    role: z.string().optional(),
    duration: z.string().optional(),
    client: z.string().optional(),
    year: z.number().optional(),
    featured: z.boolean().optional().default(false),
    status: z.enum(["completed", "in-progress", "concept"]).optional().default("completed"),
    awards: z.array(z.object({
      name: z.string(),
      organization: z.string(),
      year: z.number()
    })).optional()
  })),
  about: z.object({
    name: z.string(),
    title: z.string(),
    bio: z.string(),
    avatarUrl: z.string().optional(),
    resumeUrl: z.string().optional(),
    location: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    socialLinks: z.array(z.object({
      platform: z.string(),
      url: z.string(),
      icon: z.string().optional()
    })).optional(),
    skills: z.array(z.object({
      name: z.string(),
      level: z.number(),
      category: z.string().optional()
    })).optional(),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      duration: z.string(),
      description: z.string().optional()
    })).optional(),
    education: z.array(z.object({
      institution: z.string(),
      degree: z.string(),
      duration: z.string(),
      description: z.string().optional()
    })).optional()
  }).optional(),
  layout: z.enum(["grid", "masonry", "timeline"]).default("grid"),
  categories: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().optional()
  })),
  contact: z.object({
    enabled: z.boolean().default(true),
    form: z.boolean().default(true),
    socialLinks: z.boolean().default(true)
  }).optional()
});

// Export all schemas
export const templateSchemas = {
  dashboard: DashboardSchema,
  dataTable: DataTableSchema,
  productCatalog: ProductCatalogSchema,
  profileCard: ProfileCardSchema,
  timeline: TimelineSchema,
  gallery: GallerySchema,
  pricing: PricingSchema,
  stats: StatsSchema,
  calendar: CalendarSchema,
  wizard: WizardSchema,
  chart: ChartSchema,
  map: MapSchema,
  kanban: KanbanSchema,
  feed: FeedSchema,
  form: FormSchema,
  marketplace: MarketplaceSchema,
  analytics: AnalyticsSchema,
  ecommerce: EcommerceSchema,
  blog: BlogSchema,
  portfolio: PortfolioSchema
} as const;

export type TemplateType = keyof typeof templateSchemas;
export type TemplateConfig<T extends TemplateType> = z.infer<typeof templateSchemas[T]>;
