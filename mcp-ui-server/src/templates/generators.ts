import { templateSchemas, TemplateType, TemplateConfig } from "../schemas.js";

export interface TemplateGenerator<T extends TemplateType> {
  name: string;
  description: string;
  capabilities: string[];
  useCases: string[];
  generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
    // Enhanced parameters for dynamic content
    customData?: Record<string, any>;
    images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>;
    textContent?: Record<string, string>;
    brandingConfig?: {
      logoUrl?: string;
      brandName?: string;
      brandColors?: string[];
      fontFamily?: string;
    };
  }): Promise<TemplateConfig<T>>;
}

export class DashboardGenerator implements TemplateGenerator<"dashboard"> {
  name = "Dashboard Template";
  description = "Interactive dashboards with metrics, charts, and activity feeds";
  capabilities = [
    "Real-time metrics display",
    "Multiple chart types (line, bar, pie, area)",
    "Recent activity feeds",
    "Responsive grid layouts",
    "Customizable color schemes"
  ];
  useCases = [
    "Business analytics dashboards",
    "Application monitoring",
    "Financial reporting",
    "Project management overviews",
    "Marketing campaign tracking",
    "Sales performance monitoring"
  ];

  async generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
    customData?: Record<string, any>;
    images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>;
    textContent?: Record<string, string>;
    brandingConfig?: {
      logoUrl?: string;
      brandName?: string;
      brandColors?: string[];
      fontFamily?: string;
    };
  }): Promise<TemplateConfig<"dashboard">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig } = params;

    // Generate default metrics based on use case and custom data
    const defaultMetrics = this.generateMetrics(useCase, customData);
    const defaultCharts = this.generateCharts(useCase, customData);
    const defaultActivity = this.generateActivity(useCase, customData, images);

    return {
      templateType: "dashboard",
      title,
      description: description || `${title} - Comprehensive dashboard with real-time metrics and insights`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      layout: customConfig?.layout || "grid",
      metrics: customConfig?.metrics || defaultMetrics,
      charts: customConfig?.charts || defaultCharts,
      recentActivity: customConfig?.recentActivity || defaultActivity,
      actionButtonText: customConfig?.actionButtonText || "Refresh Data",
      // Enhanced dynamic content
      customData,
      images,
      textContent,
      brandingConfig,
      // New enhanced fields for dashboard
      widgets: customConfig?.widgets,
      navigation: customConfig?.navigation || this.generateNavigation(useCase)
    };
  }

  private generateMetrics(useCase?: string, customData?: Record<string, any>) {
    const baseMetrics = [
      {
        id: "total-users",
        label: "Total Users",
        value: "12,458",
        change: 12.5,
        changeType: "increase" as const,
        icon: "Users",
        color: "#3b82f6"
      },
      {
        id: "revenue",
        label: "Revenue",
        value: "$45,210",
        change: 8.2,
        changeType: "increase" as const,
        icon: "DollarSign",
        color: "#10b981"
      },
      {
        id: "conversion",
        label: "Conversion Rate",
        value: "3.2%",
        change: -2.1,
        changeType: "decrease" as const,
        icon: "TrendingUp",
        color: "#f59e0b"
      },
      {
        id: "satisfaction",
        label: "Satisfaction",
        value: "4.8/5",
        change: 0.3,
        changeType: "increase" as const,
        icon: "Star",
        color: "#8b5cf6"
      }
    ];

    // Customize based on use case
    if (useCase?.toLowerCase().includes("marketing")) {
      return [
        ...baseMetrics,
        {
          id: "ctr",
          label: "Click-through Rate",
          value: "2.4%",
          change: 5.1,
          changeType: "increase" as const,
          icon: "MousePointer",
          color: "#ec4899"
        }
      ];
    }

    return baseMetrics;
  }

  private generateCharts(useCase?: string, customData?: Record<string, any>) {
    return [
      {
        id: "revenue-chart",
        type: "line" as const,
        title: "Revenue Trend",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: "Revenue",
            data: [30000, 35000, 42000, 38000, 45000, 48000],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)"
          }]
        },
        height: 300
      },
      {
        id: "user-growth",
        type: "bar" as const,
        title: "User Growth",
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: "New Users",
            data: [120, 190, 300, 500],
            backgroundColor: "#10b981"
          }]
        },
        height: 250
      }
    ];
  }

  private generateActivity(useCase?: string, customData?: Record<string, any>, images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>) {
    return [
      {
        id: "activity-1",
        title: "New user registration",
        description: "john.doe@example.com joined the platform",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        icon: "UserPlus"
      },
      {
        id: "activity-2",
        title: "Payment processed",
        description: "$299 payment received from Premium subscriber",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        icon: "CreditCard"
      },
      {
        id: "activity-3",
        title: "System update",
        description: "Database backup completed successfully",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        icon: "Server"
      }
    ];
  }

  private generateNavigation(useCase?: string) {
    const baseNavigation = [
      { label: "Overview", icon: "Home", action: "overview" },
      { label: "Analytics", icon: "BarChart3", action: "analytics" },
      { label: "Reports", icon: "FileText", action: "reports" },
      { label: "Settings", icon: "Settings", action: "settings" }
    ];

    if (useCase?.toLowerCase().includes("ecommerce")) {
      return [
        ...baseNavigation,
        { label: "Orders", icon: "ShoppingCart", action: "orders", badge: "12" },
        { label: "Products", icon: "Package", action: "products" }
      ];
    }

    if (useCase?.toLowerCase().includes("marketing")) {
      return [
        ...baseNavigation,
        { label: "Campaigns", icon: "Megaphone", action: "campaigns", badge: "3" },
        { label: "Leads", icon: "Users", action: "leads" }
      ];
    }

    return baseNavigation;
  }
}

export class DataTableGenerator implements TemplateGenerator<"dataTable"> {
  name = "Data Table Template";
  description = "Sortable, filterable data tables with pagination and advanced features";
  capabilities = [
    "Sortable columns",
    "Advanced filtering",
    "Pagination with customizable page sizes",
    "Cell formatters (badges, images, actions)",
    "Export functionality",
    "Row selection"
  ];
  useCases = [
    "User management interfaces",
    "Product inventory listings",
    "Transaction histories",
    "Report data display",
    "Content management systems",
    "Analytics data presentation"
  ];

  async generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
  }): Promise<TemplateConfig<"dataTable">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen } = params;

    const defaultColumns = this.generateColumns(useCase);
    const defaultData = this.generateData(defaultColumns, useCase);
    const defaultFilters = this.generateFilters(useCase);

    return {
      templateType: "dataTable",
      title,
      description: description || `${title} - Comprehensive data table with sorting and filtering`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      columns: customConfig?.columns || defaultColumns,
      data: customConfig?.data || defaultData,
      pagination: {
        enabled: true,
        pageSize: 10,
        pageSizeOptions: [5, 10, 20, 50]
      },
      filters: customConfig?.filters || defaultFilters,
      actionButtonText: "Export Data"
    };
  }

  private generateColumns(useCase?: string) {
    if (useCase?.toLowerCase().includes("user")) {
      return [
        { id: "id", header: "ID", accessorKey: "id", enableSorting: true },
        { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
        { id: "email", header: "Email", accessorKey: "email", enableSorting: true },
        { 
          id: "status", 
          header: "Status", 
          accessorKey: "status", 
          enableSorting: true,
          cell: { type: "badge", options: { variant: "outline" } }
        },
        { id: "created", header: "Created", accessorKey: "createdAt", enableSorting: true },
        { 
          id: "actions", 
          header: "Actions", 
          accessorKey: "actions",
          enableSorting: false,
          cell: { type: "actions", options: { actions: ["edit", "delete"] } }
        }
      ];
    }

    // Default columns
    return [
      { id: "id", header: "ID", accessorKey: "id", enableSorting: true },
      { id: "name", header: "Name", accessorKey: "name", enableSorting: true },
      { id: "category", header: "Category", accessorKey: "category", enableSorting: true },
      { 
        id: "status", 
        header: "Status", 
        accessorKey: "status",
        enableSorting: true,
        cell: { type: "badge" }
      },
      { id: "updated", header: "Last Updated", accessorKey: "updatedAt", enableSorting: true }
    ];
  }

  private generateData(columns: any[], useCase?: string) {
    const rowCount = 25;
    const data = [];

    for (let i = 1; i <= rowCount; i++) {
      const row: any = {};
      
      columns.forEach(col => {
        switch (col.accessorKey) {
          case "id":
            row.id = i;
            break;
          case "name":
            row.name = `Item ${i}`;
            break;
          case "email":
            row.email = `user${i}@example.com`;
            break;
          case "category":
            row.category = ["Electronics", "Clothing", "Books", "Home"][i % 4];
            break;
          case "status":
            row.status = ["Active", "Inactive", "Pending"][i % 3];
            break;
          case "createdAt":
          case "updatedAt":
            row[col.accessorKey] = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            break;
        }
      });

      data.push(row);
    }

    return data;
  }

  private generateFilters(useCase?: string) {
    return [
      {
        id: "status",
        label: "Status",
        type: "select" as const,
        options: [
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Pending", value: "pending" }
        ]
      },
      {
        id: "search",
        label: "Search",
        type: "text" as const
      },
      {
        id: "date",
        label: "Date Range",
        type: "date" as const
      }
    ];
  }
}

export class ProductCatalogGenerator implements TemplateGenerator<"productCatalog"> {
  name = "Product Catalog Template";
  description = "E-commerce style product listings with filtering and sorting";
  capabilities = [
    "Grid and list view layouts",
    "Product filtering by category and attributes",
    "Price sorting and filtering",
    "Product ratings and reviews",
    "Stock status indicators",
    "Product badges and labels"
  ];
  useCases = [
    "E-commerce product listings",
    "Digital marketplace catalogs",
    "Service offering displays",
    "Portfolio showcases",
    "Resource libraries",
    "Course catalogs"
  ];

  async generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
    customData?: Record<string, any>;
    images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>;
    textContent?: Record<string, string>;
    brandingConfig?: {
      logoUrl?: string;
      brandName?: string;
      brandColors?: string[];
      fontFamily?: string;
    };
  }): Promise<TemplateConfig<"productCatalog">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig } = params;

    const defaultProducts = this.generateProducts(useCase, customData, images);
    const defaultCategories = this.generateCategories(useCase, customData);

    return {
      templateType: "productCatalog",
      title,
      description: description || `${title} - Discover and browse our product collection`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      layout: customConfig?.layout || "grid",
      products: customConfig?.products || defaultProducts,
      categories: customConfig?.categories || defaultCategories,
      sorting: {
        enabled: true,
        options: [
          { label: "Featured", value: "featured" },
          { label: "Price: Low to High", value: "price_asc" },
          { label: "Price: High to Low", value: "price_desc" },
          { label: "Name A-Z", value: "name_asc" },
          { label: "Rating", value: "rating" }
        ]
      },
      actionButtonText: "View All Products"
    };
  }

  private generateProducts(useCase?: string, customData?: Record<string, any>, images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>) {
    // Use provided images for products if available
    const productImages = images?.filter(img => img.category === 'product') || [];
    
    const products = [
      {
        id: "prod-1",
        name: customData?.productNames?.[0] || "Premium Wireless Headphones",
        description: customData?.productDescriptions?.[0] || "High-quality wireless headphones with noise cancellation and premium sound quality.",
        price: customData?.productPrices?.[0] || 299.99,
        currency: customData?.currency || "USD",
        imageUrl: productImages[0]?.url || "/placeholder.jpg?height=300&width=300",
        images: productImages.slice(0, 3).map(img => img.url),
        rating: customData?.productRatings?.[0] || 4.8,
        reviewCount: customData?.reviewCounts?.[0] || 124,
        badges: customData?.productBadges?.[0] || ["Best Seller", "Premium"],
        category: "Electronics",
        inStock: true
      },
      {
        id: "prod-2",
        name: "Smart Fitness Tracker",
        description: "Advanced fitness tracker with heart rate monitoring and GPS functionality.",
        price: 199.99,
        currency: "USD",
        imageUrl: "/placeholder.jpg?height=300&width=300",
        rating: 4.6,
        badges: ["New"],
        category: "Electronics",
        inStock: true
      },
      {
        id: "prod-3",
        name: "Ergonomic Office Chair",
        description: "Comfortable ergonomic office chair with lumbar support and adjustable height.",
        price: 449.99,
        currency: "USD",
        imageUrl: "/placeholder.jpg?height=300&width=300",
        rating: 4.7,
        badges: ["Popular"],
        category: "Furniture",
        inStock: false
      },
      {
        id: "prod-4",
        name: "Professional Camera Lens",
        description: "High-performance camera lens for professional photography and videography.",
        price: 899.99,
        currency: "USD",
        imageUrl: "/placeholder.jpg?height=300&width=300",
        rating: 4.9,
        badges: ["Professional"],
        category: "Photography",
        inStock: true
      }
    ];

    if (useCase?.toLowerCase().includes("digital")) {
      return products.map(p => ({
        ...p,
        name: `Digital ${p.name}`,
        description: `Digital version of ${p.description}`,
        price: p.price * 0.7 // Digital products typically cost less
      }));
    }

    return products;
  }

  private generateCategories(useCase?: string, customData?: Record<string, any>) {
    const categoryImages = customData?.categoryImages || [];
    const categoryNames = customData?.categoryNames || [];
    
    if (categoryNames.length > 0) {
      return categoryNames.map((name: string, index: number) => ({
        id: `category-${index + 1}`,
        name,
        imageUrl: categoryImages[index] || undefined,
        description: customData?.categoryDescriptions?.[index] || undefined
      }));
    }

    // Default categories based on use case
    if (useCase?.toLowerCase().includes("book")) {
      return [
        { id: "fiction", name: "Fiction", description: "Novels and story collections" },
        { id: "non-fiction", name: "Non-Fiction", description: "Educational and factual books" },
        { id: "sci-fi", name: "Science Fiction", description: "Futuristic and speculative fiction" },
        { id: "mystery", name: "Mystery", description: "Thriller and detective stories" }
      ];
    }

    return [
      { id: "electronics", name: "Electronics", description: "Latest gadgets and devices" },
      { id: "furniture", name: "Furniture", description: "Home and office furniture" },
      { id: "photography", name: "Photography", description: "Cameras and photography equipment" },
      { id: "accessories", name: "Accessories", description: "Fashion and tech accessories" }
    ];
  }
}

// Additional generators would follow similar patterns...
// For brevity, I'll create a few more key ones

export class FormGenerator implements TemplateGenerator<"form"> {
  name = "Dynamic Form Template";
  description = "Multi-section forms with validation and various input types";
  capabilities = [
    "Multi-section forms",
    "Field validation",
    "Various input types",
    "Conditional fields",
    "Progress indicators",
    "File uploads"
  ];
  useCases = [
    "User registration forms",
    "Survey and feedback forms",
    "Application forms",
    "Contact forms",
    "Order forms",
    "Profile setup forms"
  ];

  async generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
    customData?: Record<string, any>;
    images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>;
    textContent?: Record<string, string>;
    brandingConfig?: {
      logoUrl?: string;
      brandName?: string;
      brandColors?: string[];
      fontFamily?: string;
    };
  }): Promise<TemplateConfig<"form">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig } = params;

    const defaultSections = this.generateSections(useCase, customData);

    return {
      templateType: "form",
      title,
      description: description || `${title} - Please fill out the form below`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      formStyle: customConfig?.formStyle || "modern",
      headerImage: images?.[0]?.url || customConfig?.headerImage,
      sections: customConfig?.sections || defaultSections,
      submitButtonText: customConfig?.submitButtonText || "Submit Form",
      cancelButtonText: customConfig?.cancelButtonText || "Cancel",
      showProgress: customConfig?.showProgress !== false,
      progressType: customConfig?.progressType || "bar",
      submitAction: customConfig?.submitAction || {
        type: "api",
        successMessage: "Form submitted successfully!",
        errorMessage: "There was an error submitting the form."
      },
      footer: customConfig?.footer || (textContent ? {
        text: textContent.footerText || "By submitting this form, you agree to our terms and conditions.",
        links: [
          { text: "Privacy Policy", url: "/privacy" },
          { text: "Terms of Service", url: "/terms" }
        ]
      } : undefined),
      branding: brandingConfig || customConfig?.branding,
      // Enhanced dynamic content
      customData,
      images,
      textContent,
      brandingConfig
    };
  }

  private generateSections(useCase?: string, customData?: Record<string, any>) {
    if (useCase?.toLowerCase().includes("registration")) {
      return [
        {
          id: "personal",
          title: "Personal Information",
          description: "Please provide your basic information",
          columns: 2,
          fields: [
            {
              id: "firstName",
              type: "text" as const,
              label: "First Name",
              placeholder: "Enter your first name",
              required: true
            },
            {
              id: "lastName",
              type: "text" as const,
              label: "Last Name",
              placeholder: "Enter your last name",
              required: true
            },
            {
              id: "email",
              type: "email" as const,
              label: "Email Address",
              placeholder: "Enter your email",
              required: true
            },
            {
              id: "phone",
              type: "phone" as const,
              label: "Phone Number",
              placeholder: "Enter your phone number",
              required: false
            }
          ]
        },
        {
          id: "preferences",
          title: "Preferences",
          description: "Tell us about your preferences",
          columns: 1,
          fields: [
            {
              id: "notifications",
              type: "checkbox" as const,
              label: "Email Notifications",
              required: false,
              options: [
                { label: "Marketing emails", value: "marketing" },
                { label: "Product updates", value: "updates" },
                { label: "Security alerts", value: "security" }
              ]
            },
            {
              id: "bio",
              type: "textarea" as const,
              label: "Bio",
              placeholder: "Tell us about yourself",
              required: false
            }
          ]
        }
      ];
    }

    // Default contact form
    return [
      {
        id: "contact",
        title: "Contact Information",
        description: "How can we help you?",
        columns: 1,
        fields: [
          {
            id: "name",
            type: "text" as const,
            label: "Full Name",
            placeholder: "Enter your full name",
            required: true
          },
          {
            id: "email",
            type: "email" as const,
            label: "Email Address",
            placeholder: "Enter your email",
            required: true
          },
          {
            id: "subject",
            type: "select" as const,
            label: "Subject",
            required: true,
            options: [
              { label: "General Inquiry", value: "general" },
              { label: "Support Request", value: "support" },
              { label: "Sales Question", value: "sales" },
              { label: "Partnership", value: "partnership" }
            ]
          },
          {
            id: "message",
            type: "textarea" as const,
            label: "Message",
            placeholder: "Please describe your inquiry",
            required: true
          }
        ]
      }
    ];
  }
}

export class AnalyticsGenerator implements TemplateGenerator<"analytics"> {
  name = "Analytics Dashboard Template";
  description = "Comprehensive analytics dashboards with KPIs, charts, and insights";
  capabilities = [
    "KPI tracking and monitoring",
    "Multiple chart types with insights",
    "Time range selection",
    "Audience segmentation",
    "Goal tracking",
    "Performance comparisons"
  ];
  useCases = [
    "Website analytics dashboards",
    "Marketing campaign analysis",
    "Sales performance tracking",
    "User behavior analysis",
    "Financial reporting",
    "Product usage analytics"
  ];

  async generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
  }): Promise<TemplateConfig<"analytics">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen } = params;

    return {
      templateType: "analytics",
      title,
      description: description || `${title} - Comprehensive analytics and insights`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || true, // Analytics often work better full screen
      closeButtonText: "Close",
      timeRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        presets: [
          { label: "Last 7 days", value: "7d" },
          { label: "Last 30 days", value: "30d" },
          { label: "Last 90 days", value: "90d" },
          { label: "Last 12 months", value: "12m" }
        ]
      },
      kpis: this.generateKPIs(useCase),
      charts: this.generateCharts(useCase),
      segments: this.generateSegments(useCase),
      goals: this.generateGoals(useCase),
      actionButtonText: "Generate Report"
    };
  }

  private generateKPIs(useCase?: string) {
    return [
      {
        id: "visitors",
        label: "Total Visitors",
        value: "284,392",
        change: 12.5,
        changeType: "increase" as const,
        target: 300000,
        format: "number" as const,
        icon: "Users"
      },
      {
        id: "conversion",
        label: "Conversion Rate",
        value: 3.24,
        change: -0.8,
        changeType: "decrease" as const,
        target: 4.0,
        format: "percentage" as const,
        icon: "TrendingUp"
      },
      {
        id: "revenue",
        label: "Revenue",
        value: 89420,
        change: 15.2,
        changeType: "increase" as const,
        target: 100000,
        format: "currency" as const,
        icon: "DollarSign"
      },
      {
        id: "engagement",
        label: "Avg. Session Duration",
        value: "4m 32s",
        change: 8.1,
        changeType: "increase" as const,
        format: "duration" as const,
        icon: "Clock"
      }
    ];
  }

  private generateCharts(useCase?: string) {
    return [
      {
        id: "traffic-trend",
        title: "Traffic Trend",
        type: "line" as const,
        data: {
          labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
          datasets: [{
            label: "Visitors",
            data: [65000, 70000, 68000, 75000],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)"
          }]
        },
        insights: [
          "Traffic increased by 15% compared to last month",
          "Peak traffic occurs on weekdays between 10-11 AM",
          "Mobile traffic accounts for 68% of total visitors"
        ],
        height: 350
      },
      {
        id: "conversion-funnel",
        title: "Conversion Funnel",
        type: "funnel" as const,
        data: {
          labels: ["Visitors", "Product Views", "Cart Adds", "Purchases"],
          datasets: [{
            data: [100000, 45000, 12000, 3240],
            backgroundColor: ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b"]
          }]
        },
        insights: [
          "45% of visitors view products",
          "Cart abandonment rate is 73%",
          "Checkout completion rate is 27%"
        ],
        height: 300
      }
    ];
  }

  private generateSegments(useCase?: string) {
    return [
      {
        id: "new-users",
        name: "New Users",
        criteria: "First visit within 30 days",
        size: 45230,
        growth: 8.2
      },
      {
        id: "returning-users",
        name: "Returning Users",
        criteria: "Multiple visits in 30 days",
        size: 189340,
        growth: 12.1
      },
      {
        id: "power-users",
        name: "Power Users",
        criteria: "5+ sessions per week",
        size: 23890,
        growth: 15.6
      }
    ];
  }

  private generateGoals(useCase?: string) {
    return [
      {
        id: "monthly-revenue",
        name: "Monthly Revenue Goal",
        target: 100000,
        current: 89420,
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "on-track" as const
      },
      {
        id: "user-acquisition",
        name: "New User Acquisition",
        target: 50000,
        current: 45230,
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "on-track" as const
      }
    ];
  }
}

export class GalleryGenerator implements TemplateGenerator<"gallery"> {
  name = "Gallery Template";
  description = "Image galleries with lightbox, filtering, and various layout options";
  capabilities = [
    "Multiple layout types (grid, masonry, carousel)",
    "Image lightbox functionality",
    "Category-based filtering",
    "Metadata display",
    "Responsive image handling",
    "Custom image URLs"
  ];
  useCases = [
    "Photography portfolios",
    "Product showcases",
    "Event photo galleries",
    "Art collections",
    "Travel photography",
    "Real estate listings"
  ];

  async generate(params: {
    title: string;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
    customData?: Record<string, any>;
    images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>;
    textContent?: Record<string, string>;
    brandingConfig?: {
      logoUrl?: string;
      brandName?: string;
      brandColors?: string[];
      fontFamily?: string;
    };
  }): Promise<TemplateConfig<"gallery">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig } = params;

    // Generate gallery items using provided images if available
    const defaultItems = this.generateGalleryItems(useCase, images, customData, brandingConfig);
    const defaultCategories = this.generateCategories(useCase, images, customData);

    return {
      templateType: "gallery",
      title,
      description: description || `${title} - A curated collection of stunning imagery`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      layout: customConfig?.layout || "grid",
      items: customConfig?.items || defaultItems,
      categories: customConfig?.categories || defaultCategories,
      lightbox: customConfig?.lightbox !== false,
      columns: customConfig?.columns || 3,
      aspectRatio: customConfig?.aspectRatio || "auto",
      spacing: customConfig?.spacing || 4,
      filters: customConfig?.filters || this.generateFilters(defaultCategories),
      sortOptions: customConfig?.sortOptions || [
        { label: "Date", value: "date" },
        { label: "Title", value: "title" },
        { label: "Category", value: "category" }
      ],
      // Enhanced dynamic content
      customData,
      images,
      textContent,
      brandingConfig
    };
  }

  private generateGalleryItems(useCase?: string, images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>, customData?: Record<string, any>, brandingConfig?: { logoUrl?: string; brandName?: string; brandColors?: string[]; fontFamily?: string }) {
    // Use provided images if available
    if (images && images.length > 0) {
      return images.map((image, index) => ({
        id: image.id || `image-${index + 1}`,
        title: image.caption || image.alt || `Image ${index + 1}`,
        description: customData?.imageDescriptions?.[index] || `Beautiful ${image.category || 'image'} captured with artistic vision`,
        imageUrl: image.url,
        thumbnailUrl: image.url + "?w=400", // Generate thumbnail URL
        highResUrl: image.url + "?w=1920", // High res for lightbox
        category: image.category || "uncategorized",
        tags: customData?.imageTags?.[index] || this.generateTags(image.category, useCase),
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        author: customData?.photographer || brandingConfig?.brandName || "Photographer",
        location: customData?.imageLocations?.[index] || this.generateLocation(image.category),
        dimensions: {
          width: 1920,
          height: 1080
        },
        metadata: {
          camera: customData?.cameraInfo?.[index] || "Canon EOS R5",
          lens: customData?.lensInfo?.[index] || "24-70mm f/2.8",
          settings: customData?.cameraSettings?.[index] || "f/8, 1/125s, ISO 100"
        },
        likes: Math.floor(Math.random() * 500) + 50,
        views: Math.floor(Math.random() * 2000) + 200,
        socialShare: true
      }));
    }

    // Generate default items based on use case
    const defaultImages = this.getDefaultImages(useCase);
    return defaultImages.map((img, index) => ({
      id: `img-${index + 1}`,
      title: img.title,
      description: img.description,
      imageUrl: img.url,
      thumbnailUrl: img.url,
      category: img.category,
      tags: img.tags,
      date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      author: "Photographer",
      location: img.location,
      likes: Math.floor(Math.random() * 500) + 50,
      views: Math.floor(Math.random() * 2000) + 200
    }));
  }

  private generateCategories(useCase?: string, images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>, customData?: Record<string, any>) {
    // Extract categories from provided images
    if (images && images.length > 0) {
      const categories = [...new Set(images.map(img => img.category).filter(Boolean))];
      return categories.map((cat, index) => ({
        id: cat!.toLowerCase().replace(/\s+/g, '-'),
        name: cat!,
        imageUrl: images.find(img => img.category === cat)?.url,
        description: customData?.categoryDescriptions?.[cat!] || `Stunning ${cat} photography`,
        count: images.filter(img => img.category === cat).length
      }));
    }

    // Default categories based on use case
    if (useCase?.toLowerCase().includes("landscape") || useCase?.toLowerCase().includes("nature")) {
      return [
        { id: "mountains", name: "Mountains", description: "Majestic mountain landscapes", count: 12 },
        { id: "forests", name: "Forests", description: "Serene forest scenes", count: 8 },
        { id: "lakes", name: "Lakes", description: "Peaceful lake reflections", count: 6 },
        { id: "wildlife", name: "Wildlife", description: "Nature's creatures", count: 4 }
      ];
    }

    return [
      { id: "featured", name: "Featured", description: "Highlighted works", count: 10 },
      { id: "recent", name: "Recent", description: "Latest additions", count: 15 },
      { id: "popular", name: "Popular", description: "Most viewed", count: 20 }
    ];
  }

  private generateFilters(categories: any[]) {
    return [
      {
        id: "category",
        label: "Category",
        type: "category" as const,
        options: categories.map(cat => ({
          label: cat.name,
          value: cat.id,
          count: cat.count
        }))
      }
    ];
  }

  private generateTags(category?: string, useCase?: string) {
    const tags = [];
    if (category) {
      tags.push(category);
    }
    if (useCase?.includes("landscape")) {
      tags.push("landscape", "nature", "outdoor");
    }
    if (useCase?.includes("portrait")) {
      tags.push("portrait", "people", "photography");
    }
    return tags.length > 0 ? tags : ["photography", "art"];
  }

  private generateLocation(category?: string) {
    const locations = {
      "mountains": "Rocky Mountains, Colorado",
      "forests": "Pacific Northwest",
      "lakes": "Lake Tahoe, California",
      "wildlife": "Yellowstone National Park",
      "default": "Various Locations"
    };
    return locations[category as keyof typeof locations] || locations.default;
  }

  private getDefaultImages(useCase?: string) {
    if (useCase?.toLowerCase().includes("landscape")) {
      return [
        {
          title: "Mountain Peak at Sunrise",
          description: "Golden hour illuminates the majestic mountain peaks",
          url: "/placeholder.jpg?height=600&width=800&text=Mountain+Landscape",
          category: "mountains",
          tags: ["landscape", "mountains", "sunrise"],
          location: "Rocky Mountains"
        },
        {
          title: "Forest Path",
          description: "A winding path through ancient forest",
          url: "/placeholder.jpg?height=600&width=800&text=Forest+Path",
          category: "forests",
          tags: ["landscape", "forest", "path"],
          location: "Pacific Northwest"
        },
        {
          title: "Lake Reflection",
          description: "Perfect mirror reflection on a calm mountain lake",
          url: "/placeholder.jpg?height=600&width=800&text=Lake+Reflection",
          category: "lakes",
          tags: ["landscape", "lake", "reflection"],
          location: "Lake Tahoe"
        }
      ];
    }

    return [
      {
        title: "Featured Image 1",
        description: "A stunning photograph showcasing artistic vision",
        url: "/placeholder.jpg?height=400&width=600",
        category: "featured",
        tags: ["photography", "art"],
        location: "Studio"
      },
      {
        title: "Featured Image 2",
        description: "Another beautiful capture from our collection",
        url: "/placeholder.jpg?height=400&width=600",
        category: "featured",
        tags: ["photography", "creative"],
        location: "On Location"
      }
    ];
  }
}
