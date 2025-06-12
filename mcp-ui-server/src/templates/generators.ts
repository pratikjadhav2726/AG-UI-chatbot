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
  }): Promise<TemplateConfig<"dashboard">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen } = params;

    // Generate default metrics based on use case
    const defaultMetrics = this.generateMetrics(useCase);
    const defaultCharts = this.generateCharts(useCase);
    const defaultActivity = this.generateActivity(useCase);

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
      actionButtonText: "Refresh Data"
    };
  }

  private generateMetrics(useCase?: string) {
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

  private generateCharts(useCase?: string) {
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

  private generateActivity(useCase?: string) {
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
  }): Promise<TemplateConfig<"productCatalog">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen } = params;

    const defaultProducts = this.generateProducts(useCase);
    const defaultCategories = this.generateCategories(useCase);

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

  private generateProducts(useCase?: string) {
    const products = [
      {
        id: "prod-1",
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
        price: 299.99,
        currency: "USD",
        imageUrl: "/placeholder.jpg?height=300&width=300",
        rating: 4.8,
        badges: ["Best Seller", "Premium"],
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

  private generateCategories(useCase?: string) {
    return [
      { id: "electronics", name: "Electronics" },
      { id: "furniture", name: "Furniture" },
      { id: "photography", name: "Photography" },
      { id: "accessories", name: "Accessories" }
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
  }): Promise<TemplateConfig<"form">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen } = params;

    const defaultSections = this.generateSections(useCase);

    return {
      templateType: "form",
      title,
      description: description || `${title} - Please fill out the form below`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      sections: customConfig?.sections || defaultSections,
      submitButtonText: "Submit Form",
      cancelButtonText: "Cancel",
      showProgress: true
    };
  }

  private generateSections(useCase?: string) {
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
