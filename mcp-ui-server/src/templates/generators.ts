import { templateSchemas, TemplateType, ActionSchema } from "../schemas.js";
import type { TemplateConfig } from "../schemas.js";

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

    const refreshAction: ActionSchema = {
      id: "dashboardRefresh",
      trigger: "onSubmit", // onSubmit is a convention for the main footer button
      type: "MCP_TOOL_CALL",
      toolName: "generate_ui_template",
      arguments: { // Static arguments for the tool
        templateType: "dashboard",
        title: params.title,
        description: params.description,
        useCase: params.useCase,
        // Note: Passing params.customData might be stale.
        // A more robust refresh might need to indicate what to refresh.
        // For now, this demonstrates the structure.
        customData: params.customData,
        theme: params.theme,
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen
      },
      label: customConfig?.actionButtonText || "Refresh Data"
    };

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
      actionButtonText: refreshAction.label, // Keep for the button's text
      actions: [refreshAction], // Populate the actions array
      customData: params.customData, // Ensure customData is passed
      images,
      textContent,
      brandingConfig,
      // New enhanced fields for dashboard
      widgets: customConfig?.widgets,
      navigation: customConfig?.navigation || this.generateNavigation(useCase)
    };
  }

  private generateMetrics(useCase?: string, customData?: Record<string, any>) {
    // If custom dashboard metrics are provided, use them directly
    if (customData?.dashboardMetrics && Array.isArray(customData.dashboardMetrics)) {
      return customData.dashboardMetrics;
    }

    // Gaming tournament registration form
    if (useCase?.toLowerCase().includes('gaming') || useCase?.toLowerCase().includes('tournament')) {
      return [
        {
          id: "total-participants",
          label: "Total Participants",
          value: customData?.totalParticipants || "1,247",
          change: customData?.participantsChange || 12.5,
          changeType: "increase" as const,
          icon: "users",
          color: "blue"
        },
        {
          id: "active-tournaments",
          label: "Active Tournaments",
          value: customData?.activeTournaments || "8",
          change: customData?.tournamentsChange || 2,
          changeType: "increase" as const,
          icon: "trophy",
          color: "green"
        },
        {
          id: "prize-pool",
          label: "Total Prize Pool",
          value: customData?.prizePool || "$45,230",
          change: customData?.prizePoolChange || 8.3,
          changeType: "increase" as const,
          icon: "dollar-sign",
          color: "purple"
        },
        {
          id: "avg-participants",
          label: "Avg. Participants/Tournament",
          value: customData?.avgParticipants || "156",
          change: customData?.avgParticipantsChange || -3.2,
          changeType: "decrease" as const,
          icon: "bar-chart-3",
          color: "orange"
        }
      ];
    }

    // E-commerce dashboard
    if (useCase?.toLowerCase().includes('ecommerce') || useCase?.toLowerCase().includes('shop')) {
      return [
        {
          id: "total-revenue",
          label: "Total Revenue",
          value: customData?.totalRevenue || "$124,563",
          change: customData?.revenueChange || 23.5,
          changeType: "increase" as const,
          icon: "dollar-sign",
          color: "green"
        },
        {
          id: "orders",
          label: "Orders",
          value: customData?.orders || "1,847",
          change: customData?.ordersChange || 12.3,
          changeType: "increase" as const,
          icon: "shopping-cart",
          color: "blue"
        },
        {
          id: "conversion-rate",
          label: "Conversion Rate",
          value: customData?.conversionRate ? `${(customData.conversionRate * 100).toFixed(1)}%` : "3.2%",
          change: customData?.conversionRateChange || 0.8,
          changeType: "increase" as const,
          icon: "trending-up",
          color: "purple"
        },
        {
          id: "avg-order-value",
          label: "Avg. Order Value",
          value: customData?.avgOrderValue || "$67.45",
          change: customData?.avgOrderValueChange || 5.2,
          changeType: "increase" as const,
          icon: "bar-chart-3",
          color: "orange"
        }
      ];
    }

    // Default business metrics
    return [
      {
        id: "total-revenue",
        label: "Total Revenue",
        value: customData?.totalRevenue || "$124,563",
        change: customData?.revenueChange || 23.5,
        changeType: "increase" as const,
        icon: "dollar-sign",
        color: "green"
      },
      {
        id: "orders",
        label: "Orders",
        value: customData?.orders || "1,847",
        change: customData?.ordersChange || 12.3,
        changeType: "increase" as const,
        icon: "shopping-cart",
        color: "blue"
      },
      {
        id: "conversion-rate",
        label: "Conversion Rate",
        value: customData?.conversionRate ? `${(customData.conversionRate * 100).toFixed(1)}%` : "3.2%",
        change: customData?.conversionRateChange || 0.8,
        changeType: "increase" as const,
        icon: "trending-up",
        color: "purple"
      },
      {
        id: "avg-order-value",
        label: "Avg. Order Value",
        value: customData?.avgOrderValue || "$67.45",
        change: customData?.avgOrderValueChange || 5.2,
        changeType: "increase" as const,
        icon: "bar-chart-3",
        color: "orange"
      }
    ];
  }

  private generateCharts(useCase?: string, customData?: Record<string, any>) {
    // If custom dashboard charts are provided, use them directly
    if (customData?.dashboardCharts && Array.isArray(customData.dashboardCharts)) {
      return customData.dashboardCharts;
    }

    // Gaming tournament charts
    if (useCase?.toLowerCase().includes('gaming') || useCase?.toLowerCase().includes('tournament')) {
      return [
        {
          id: "participant-growth",
          type: "line" as const,
          title: "Participant Growth",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Participants",
                data: [650, 720, 890, 1020, 1180, 1247],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)"
              }
            ]
          },
          insights: ["Steady growth trend", "Peak during summer months", "20% increase from last year"]
        },
        {
          id: "tournament-distribution",
          type: "pie" as const,
          title: "Tournament Types",
          data: {
            labels: ["FPS", "MOBA", "Strategy", "Sports", "Fighting"],
            datasets: [
              {
                label: "Participants",
                data: [35, 25, 20, 15, 5],
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
              }
            ]
          },
          insights: ["FPS games dominate", "Strategy games growing", "Fighting games niche"]
        }
      ];
    }

    // E-commerce charts
    if (useCase?.toLowerCase().includes('ecommerce') || useCase?.toLowerCase().includes('shop')) {
      return [
        {
          id: "revenue-trend",
          type: "line" as const,
          title: "Revenue Trend",
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Revenue",
                data: [85000, 92000, 105000, 98000, 112000, 124563],
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)"
              }
            ]
          },
          insights: ["Consistent growth trend", "Seasonal variations", "23% YoY increase"]
        },
        {
          id: "category-sales",
          type: "bar" as const,
          title: "Sales by Category",
          data: {
            labels: ["Electronics", "Clothing", "Home", "Books", "Sports"],
            datasets: [
              {
                label: "Sales",
                data: [45000, 32000, 28000, 12000, 7563],
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
              }
            ]
          },
          insights: ["Electronics lead sales", "Clothing strong performer", "Books need attention"]
        }
      ];
    }

    // Default business charts
    return [
      {
        id: "revenue-trend",
        type: "line" as const,
        title: "Revenue Trend",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue",
              data: [85000, 92000, 105000, 98000, 112000, 124563],
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)"
            }
          ]
        },
        insights: ["Consistent growth trend", "Seasonal variations", "23% YoY increase"]
      },
      {
        id: "category-sales",
        type: "bar" as const,
        title: "Sales by Category",
        data: {
          labels: ["Electronics", "Clothing", "Home", "Books", "Sports"],
          datasets: [
            {
              label: "Sales",
              data: [45000, 32000, 28000, 12000, 7563],
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
            }
          ]
        },
        insights: ["Electronics lead sales", "Clothing strong performer", "Books need attention"]
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

    const defaultColumns = this.generateColumns(useCase, customConfig?.customData);
    const defaultData = this.generateData(useCase, customConfig?.customData);
    const defaultFilters = this.generateFilters(useCase, customConfig?.customData);

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

  private generateColumns(useCase?: string, customData?: Record<string, any>) {
    // If custom data table columns are provided, use them directly
    if (customData?.dataTableColumns && Array.isArray(customData.dataTableColumns)) {
      return customData.dataTableColumns;
    }

    // Customer data table
    if (useCase?.toLowerCase().includes('customer') || useCase?.toLowerCase().includes('user')) {
      return [
        {
          id: "name",
          header: "Name",
          accessorKey: "name",
          enableSorting: true
        },
        {
          id: "email",
          header: "Email",
          accessorKey: "email",
          enableSorting: true
        },
        {
          id: "status",
          header: "Status",
          accessorKey: "status",
          enableSorting: true,
          cell: {
            type: "badge",
            options: {
              variants: {
                active: "default",
                inactive: "secondary",
                pending: "outline"
              }
            }
          }
        },
        {
          id: "lastPurchase",
          header: "Last Purchase",
          accessorKey: "lastPurchase",
          enableSorting: true
        },
        {
          id: "totalSpent",
          header: "Total Spent",
          accessorKey: "totalSpent",
          enableSorting: true
        },
        {
          id: "actions",
          header: "Actions",
          accessorKey: "actions",
          enableSorting: false,
          cell: {
            type: "actions"
          }
        }
      ];
    }

    // Product inventory table
    if (useCase?.toLowerCase().includes('product') || useCase?.toLowerCase().includes('inventory')) {
      return [
        {
          id: "productName",
          header: "Product Name",
          accessorKey: "productName",
          enableSorting: true
        },
        {
          id: "category",
          header: "Category",
          accessorKey: "category",
          enableSorting: true
        },
        {
          id: "stock",
          header: "Stock",
          accessorKey: "stock",
          enableSorting: true
        },
        {
          id: "price",
          header: "Price",
          accessorKey: "price",
          enableSorting: true
        },
        {
          id: "status",
          header: "Status",
          accessorKey: "status",
          enableSorting: true,
          cell: {
            type: "badge",
            options: {
              variants: {
                in_stock: "default",
                low_stock: "outline",
                out_of_stock: "destructive"
              }
            }
          }
        },
        {
          id: "actions",
          header: "Actions",
          accessorKey: "actions",
          enableSorting: false,
          cell: {
            type: "actions"
          }
        }
      ];
    }

    // Order management table
    if (useCase?.toLowerCase().includes('order') || useCase?.toLowerCase().includes('sales')) {
      return [
        {
          id: "orderId",
          header: "Order ID",
          accessorKey: "orderId",
          enableSorting: true
        },
        {
          id: "customer",
          header: "Customer",
          accessorKey: "customer",
          enableSorting: true
        },
        {
          id: "items",
          header: "Items",
          accessorKey: "items",
          enableSorting: true
        },
        {
          id: "total",
          header: "Total",
          accessorKey: "total",
          enableSorting: true
        },
        {
          id: "status",
          header: "Status",
          accessorKey: "status",
          enableSorting: true,
          cell: {
            type: "badge",
            options: {
              variants: {
                completed: "default",
                processing: "outline",
                cancelled: "destructive",
                pending: "secondary"
              }
            }
          }
        },
        {
          id: "date",
          header: "Date",
          accessorKey: "date",
          enableSorting: true
        },
        {
          id: "actions",
          header: "Actions",
          accessorKey: "actions",
          enableSorting: false,
          cell: {
            type: "actions"
          }
        }
      ];
    }

    // Default table columns
    return [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        enableSorting: true
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email",
        enableSorting: true
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        enableSorting: true,
        cell: {
          type: "badge",
          options: {
            variants: {
              active: "default",
              inactive: "secondary",
              pending: "outline"
            }
          }
        }
      },
      {
        id: "lastUpdated",
        header: "Last Updated",
        accessorKey: "lastUpdated",
        enableSorting: true
      },
      {
        id: "actions",
        header: "Actions",
        accessorKey: "actions",
        enableSorting: false,
        cell: {
          type: "actions"
        }
      }
    ];
  }

  private generateData(useCase?: string, customData?: Record<string, any>) {
    // If custom data table data is provided, use it directly
    if (customData?.dataTableData && Array.isArray(customData.dataTableData)) {
      return customData.dataTableData;
    }

    // Customer data
    if (useCase?.toLowerCase().includes('customer') || useCase?.toLowerCase().includes('user')) {
      return [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@example.com",
          status: "active",
          lastPurchase: "2024-01-15",
          totalSpent: "$1,250"
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane.smith@example.com",
          status: "active",
          lastPurchase: "2024-01-10",
          totalSpent: "$890"
        },
        {
          id: "3",
          name: "Bob Johnson",
          email: "bob.johnson@example.com",
          status: "inactive",
          lastPurchase: "2023-12-20",
          totalSpent: "$450"
        },
        {
          id: "4",
          name: "Alice Brown",
          email: "alice.brown@example.com",
          status: "pending",
          lastPurchase: "2024-01-05",
          totalSpent: "$320"
        }
      ];
    }

    // Product inventory data
    if (useCase?.toLowerCase().includes('product') || useCase?.toLowerCase().includes('inventory')) {
      return [
        {
          id: "1",
          productName: "Wireless Headphones",
          category: "Electronics",
          stock: 45,
          price: "$89.99",
          status: "in_stock"
        },
        {
          id: "2",
          productName: "Smart Watch",
          category: "Electronics",
          stock: 12,
          price: "$199.99",
          status: "low_stock"
        },
        {
          id: "3",
          productName: "Running Shoes",
          category: "Sports",
          stock: 0,
          price: "$129.99",
          status: "out_of_stock"
        },
        {
          id: "4",
          productName: "Coffee Maker",
          category: "Home",
          stock: 23,
          price: "$79.99",
          status: "in_stock"
        }
      ];
    }

    // Order management data
    if (useCase?.toLowerCase().includes('order') || useCase?.toLowerCase().includes('sales')) {
      return [
        {
          id: "1",
          orderId: "ORD-001",
          customer: "John Doe",
          items: 3,
          total: "$299.97",
          status: "completed",
          date: "2024-01-15"
        },
        {
          id: "2",
          orderId: "ORD-002",
          customer: "Jane Smith",
          items: 1,
          total: "$89.99",
          status: "processing",
          date: "2024-01-14"
        },
        {
          id: "3",
          orderId: "ORD-003",
          customer: "Bob Johnson",
          items: 2,
          total: "$159.98",
          status: "pending",
          date: "2024-01-13"
        },
        {
          id: "4",
          orderId: "ORD-004",
          customer: "Alice Brown",
          items: 5,
          total: "$449.95",
          status: "cancelled",
          date: "2024-01-12"
        }
      ];
    }

    // Default data
    return [
      {
        id: "1",
        name: "John Doe",
        email: "john.doe@example.com",
        status: "active",
        lastUpdated: "2024-01-15"
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        status: "active",
        lastUpdated: "2024-01-14"
      },
      {
        id: "3",
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        status: "inactive",
        lastUpdated: "2024-01-13"
      },
      {
        id: "4",
        name: "Alice Brown",
        email: "alice.brown@example.com",
        status: "pending",
        lastUpdated: "2024-01-12"
      }
    ];
  }

  private generateFilters(useCase?: string, customData?: Record<string, any>) {
    // If custom data table filters are provided, use them directly
    if (customData?.dataTableFilters && Array.isArray(customData.dataTableFilters)) {
      return customData.dataTableFilters;
    }

    // Customer filters
    if (useCase?.toLowerCase().includes('customer') || useCase?.toLowerCase().includes('user')) {
      return [
        {
          id: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "All", value: "" },
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Pending", value: "pending" }
          ]
        },
        {
          id: "search",
          label: "Search",
          type: "text"
        }
      ];
    }

    // Product inventory filters
    if (useCase?.toLowerCase().includes('product') || useCase?.toLowerCase().includes('inventory')) {
      return [
        {
          id: "category",
          label: "Category",
          type: "select",
          options: [
            { label: "All", value: "" },
            { label: "Electronics", value: "Electronics" },
            { label: "Sports", value: "Sports" },
            { label: "Home", value: "Home" }
          ]
        },
        {
          id: "status",
          label: "Stock Status",
          type: "select",
          options: [
            { label: "All", value: "" },
            { label: "In Stock", value: "in_stock" },
            { label: "Low Stock", value: "low_stock" },
            { label: "Out of Stock", value: "out_of_stock" }
          ]
        },
        {
          id: "search",
          label: "Search Products",
          type: "text"
        }
      ];
    }

    // Order management filters
    if (useCase?.toLowerCase().includes('order') || useCase?.toLowerCase().includes('sales')) {
      return [
        {
          id: "status",
          label: "Order Status",
          type: "select",
          options: [
            { label: "All", value: "" },
            { label: "Completed", value: "completed" },
            { label: "Processing", value: "processing" },
            { label: "Pending", value: "pending" },
            { label: "Cancelled", value: "cancelled" }
          ]
        },
        {
          id: "dateRange",
          label: "Date Range",
          type: "date"
        },
        {
          id: "search",
          label: "Search Orders",
          type: "text"
        }
      ];
    }

    // Default filters
    return [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "All", value: "" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
          { label: "Pending", value: "pending" }
        ]
      },
      {
        id: "search",
        label: "Search",
        type: "text"
      }
    ];
  }
}

export class ProductCatalogGenerator implements TemplateGenerator<"productCatalog"> {
  name = "Product Catalog Template";
  description = "E-commerce style product listings with filtering and sorting, rendered dynamically on client.";
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

    // Actual product data will now go into customData for the client to fetch
    const generatedProducts = this._generateSampleProducts(useCase, customData, images);
    const finalCustomData = {
      ...(customData || {}),
      // The generator provides the actual list of products here
      // The client will use itemDataSource to find this list
      productsList: generatedProducts
    };

    return {
      templateType: "productCatalog",
      title,
      description: description || `${title} - Browse our dynamic product collection`,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      layout: customConfig?.layout || "grid",
      columns: customConfig?.columns || 3,

      itemDataSource: "customData.productsList", // Points to where the data is
      itemSchema: customConfig?.itemSchema || { // Default item schema
        fields: [
          { id: "productImage", type: "image", source: "item.imageUrl", altSource: "item.name", style: "product-image" },
          { id: "productName", type: "text", source: "item.name", style: "title" },
          { id: "productDescription", type: "text", source: "item.description", style: "description", condition: "item.descriptionExists" },
          { id: "productPrice", type: "text", source: "item.price", style: "price", prefix: "$" },
          { id: "productCategory", type: "badge", source: "item.category", style: "tag", condition: "item.categoryExists"},
          {
            id: "viewDetailsButton",
            type: "button" as const, // Ensure type is literal for TS
            label: "View Details",
            actionDefinition: {
              id: "viewProductDetails",
              trigger: "onClick" as const,
              type: "CUSTOM_EVENT" as const,
              eventName: "productInteraction",
              payload: {
                actionType: "viewDetails",
                productId: "{{item.id}}", // Placeholder syntax for item's id
                productName: "{{item.name}}" // Placeholder for item's name
              }
            }
          }
        ]
      },

      categories: customConfig?.categories || this._generateCategories(useCase, finalCustomData),
      sorting: customConfig?.sorting || {
        enabled: true,
        options: [
          { label: "Featured", value: "featured" },
          { label: "Price: Low to High", value: "price_asc" },
          { label: "Price: High to Low", value: "price_desc" },
          { label: "Name A-Z", value: "name_asc" },
          { label: "Rating", value: "rating" }
        ]
      },
      // customData: finalCustomData, // This is the first one, ensure it's correctly defined as finalCustomData
      // Other base fields:
      actionButtonText: customConfig?.actionButtonText || "View All Products",
      customData: finalCustomData, // This is the one that should remain if it's the last one intended.
    };
  }

  // Renamed from generateProducts to avoid conflict if we keep old structure temporarily
  private _generateSampleProducts(useCase?: string, customData?: Record<string, any>, images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>) {
    // Use provided images for products if available
    const productImages = images?.filter(img => img.category === 'product') || [];
    return [
      { id: "prod-1", name: "Dynamic Headphones", description: "Noise cancelling.", price: 299.99, imageUrl: productImages[0]?.url || "/placeholder.jpg?height=200&width=200", category: "Electronics", descriptionExists: true, categoryExists: true },
      { id: "prod-2", name: "Smart Tracker", description: "GPS enabled.", price: 199.99, imageUrl: productImages[1]?.url || "/placeholder.jpg?height=200&width=200", category: "Wearables", descriptionExists: true, categoryExists: true },
      { id: "prod-3", name: "Minimalist Watch", price: 149.99, imageUrl: productImages[2]?.url || "/placeholder.jpg?height=200&width=200", category: "Accessories", categoryExists: true }, // No description for testing condition
    ];
  }

  private _generateCategories(useCase?: string, customData?: Record<string, any>) {
    // ... (can remain similar, possibly deriving from the generated products if needed)
     return [
        { id: "electronics", name: "Electronics" },
        { id: "wearables", name: "Wearables" },
        { id: "accessories", name: "Accessories" },
      ];
  }
}

// Additional generators would follow similar patterns...
// For brevity, I'll create a few more key ones

export class FormGenerator implements TemplateGenerator<"form"> {
  name = "Universal Form Template";
  description = "Completely flexible forms supporting any field types, layouts, and configurations";
  capabilities = [
    "Any field types (text, select, checkbox, radio, file, etc.)",
    "Multi-step wizard forms",
    "Single-page forms",
    "Custom validation rules",
    "Conditional field logic",
    "Dynamic field options",
    "Custom styling and branding",
    "Progress indicators",
    "File uploads and previews",
    "Custom field layouts",
    "Gaming/tournament forms",
    "Registration forms",
    "Survey forms",
    "Application forms"
  ];
  useCases = [
    "Gaming tournament registration",
    "User registration",
    "Survey and feedback",
    "Job applications",
    "Event registration",
    "Contact forms",
    "Order forms",
    "Profile setup",
    "Custom business forms"
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
      colors?: {
        primary?: string;
        secondary?: string;
        accent?: string;
        background?: string;
      };
    };
  }): Promise<TemplateConfig<"form">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, images, textContent, brandingConfig } = params;

    // Use completely custom sections if provided, otherwise generate defaults
    const sections = customConfig?.sections || customData?.sections || this.generateSections(useCase, customData);

    return {
      templateType: "form",
      title,
      description: description || textContent?.description || `${title} - Please fill out the form below`,
      theme: theme || "system",
      primaryColor: primaryColor || brandingConfig?.colors?.primary,
      fullScreen: fullScreen || false,
      closeButtonText: textContent?.closeButton || "Close",
      
      // Form configuration - completely flexible
      formStyle: customConfig?.formStyle || "modern",
      headerImage: images?.[0]?.url || brandingConfig?.logoUrl || customConfig?.headerImage,
      sections: sections,
      submitButtonText: textContent?.submitButton || customConfig?.submitButtonText || "Submit",
      cancelButtonText: textContent?.cancelButton || customConfig?.cancelButtonText || "Cancel",
      
      // Progress and multi-step settings
      showProgress: customConfig?.showProgress !== false && sections.length > 1,
      progressType: customConfig?.progressType || "steps",
      
      // Actions and behavior
      submitAction: customConfig?.submitAction || {
        type: "api",
        endpoint: customConfig?.submitEndpoint,
        successMessage: textContent?.successMessage || "Form submitted successfully!",
        errorMessage: textContent?.errorMessage || "There was an error submitting the form."
      },
      
      // Footer and legal
      footer: customConfig?.footer || this.generateFooter(textContent, brandingConfig),
      
      // Branding and styling
      branding: {
        logoUrl: brandingConfig?.logoUrl || images?.find(img => img.category === 'logo')?.url,
        companyName: brandingConfig?.brandName, // Map brandName to companyName
        contactInfo: textContent?.contactInfo || "Contact us for support"
      },
      
      // Enhanced dynamic content
      customData,
      images,
      textContent,
      brandingConfig
    };
  }

  private generateSections(useCase?: string, customData?: Record<string, any>) {
    // If custom form fields are provided, use them directly
    if (customData?.formFields && Array.isArray(customData.formFields)) {
      return [
        {
          id: "custom-form",
          title: "Form Information",
          description: "Please fill out the required information",
          columns: 2,
          fields: customData.formFields
        }
      ];
    }

    // If custom form sections are provided, use them directly
    if (customData?.formSections && Array.isArray(customData.formSections)) {
      return customData.formSections;
    }

    // Gaming tournament registration form
    if (useCase?.toLowerCase().includes("gaming") || useCase?.toLowerCase().includes("tournament")) {
      return [
        {
          id: "player-info",
          title: "Player Information",
          description: "Tell us about yourself",
          columns: 2,
          fields: [
            {
              id: "gamerTag",
              type: "text" as const,
              label: "Gamer Tag",
              placeholder: "Enter your gamer tag",
              required: true,
              validation: {
                minLength: 3,
                maxLength: 20,
                pattern: "^[a-zA-Z0-9_-]+$",
                message: "Gamer tag must be 3-20 characters, alphanumeric, underscore, or dash only"
              }
            },
            {
              id: "realName",
              type: "text" as const,
              label: "Real Name",
              placeholder: "Enter your real name",
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
              id: "discord",
              type: "text" as const,
              label: "Discord Username",
              placeholder: "Enter your Discord username",
              required: false
            }
          ]
        },
        {
          id: "game-info",
          title: "Game Information",
          description: "Game preferences and team details",
          columns: 1,
          fields: [
            {
              id: "gamePreference",
              type: "select" as const,
              label: "Primary Game",
              required: true,
              options: [
                { label: "Valorant", value: "valorant" },
                { label: "CS2", value: "cs2" },
                { label: "League of Legends", value: "lol" }
              ]
            },
            {
              id: "skillLevel",
              type: "radio" as const,
              label: "Skill Level",
              required: true,
              options: [
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" }
              ]
            },
            {
              id: "teamName",
              type: "text" as const,
              label: "Team Name (Optional)",
              placeholder: "Enter your team name if applicable",
              required: false,
              renderCondition: "customData.hasTeam === true" // Example condition
            },
            {
              id: "hasTeam", // This field might control the condition
              type: "checkbox" as const,
              label: "Team Status",
              options: [
                { label: "I have a pre-formed team", value: "hasTeamTrue" }, // Value that can be checked
                { label: "Looking for teammates", value: "needTeam" }
              ]
            }
          ]
        },
        {
          id: "equipment",
          title: "Equipment Specifications",
          description: "Tell us about your gaming setup",
          columns: 2,
          fields: [
            {
              id: "mouse",
              type: "text" as const,
              label: "Gaming Mouse",
              placeholder: "e.g., Logitech G Pro X",
              required: false
            },
            {
              id: "keyboard",
              type: "text" as const,
              label: "Gaming Keyboard",
              placeholder: "e.g., Razer BlackWidow",
              required: false
            },
            {
              id: "headset",
              type: "text" as const,
              label: "Gaming Headset",
              placeholder: "e.g., SteelSeries Arctis 7",
              required: false
            },
            {
              id: "monitor",
              type: "text" as const,
              label: "Monitor",
              placeholder: "e.g., ASUS 144Hz 1080p",
              required: false
            },
            {
              id: "internetSpeed",
              type: "select" as const,
              label: "Internet Speed",
              required: true,
              options: [
                { label: "Under 25 Mbps", value: "slow" },
                { label: "25-100 Mbps", value: "medium" },
                { label: "100+ Mbps", value: "fast" }
              ]
            },
            {
              id: "pcSpecs",
              type: "textarea" as const,
              label: "PC Specifications",
              placeholder: "Briefly describe your CPU, GPU, RAM",
              required: false
            }
          ]
        }
      ];
    }

    // Registration form
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
        }
      ];
    }

    // Survey form
    if (useCase?.toLowerCase().includes("survey") || useCase?.toLowerCase().includes("feedback")) {
      return [
        {
          id: "survey",
          title: "Survey Questions",
          description: "Please share your feedback",
          columns: 1,
          fields: [
            {
              id: "satisfaction",
              type: "radio" as const,
              label: "Overall Satisfaction",
              required: true,
              options: [
                { label: "Very Satisfied", value: "5" },
                { label: "Satisfied", value: "4" },
                { label: "Neutral", value: "3" },
                { label: "Dissatisfied", value: "2" },
                { label: "Very Dissatisfied", value: "1" }
              ]
            },
            {
              id: "comments",
              type: "textarea" as const,
              label: "Additional Comments",
              placeholder: "Please share any additional feedback",
              required: false
            }
          ]
        }
      ];
    }

    // Default generic form
    return [
      {
        id: "information",
        title: "Information",
        description: "Please fill out the required information",
        columns: 2,
        fields: [
          {
            id: "name",
            type: "text" as const,
            label: "Name",
            placeholder: "Enter your name",
            required: true
          },
          {
            id: "email",
            type: "email" as const,
            label: "Email",
            placeholder: "Enter your email",
            required: true
          }
        ]
      }
    ];
  }

  private generateFooter(textContent?: Record<string, string>, brandingConfig?: any) {
    return {
      text: textContent?.footerText || "By submitting this form, you agree to our terms and conditions.",
      links: [
        { text: "Privacy Policy", url: "/privacy" },
        { text: "Terms of Service", url: "/terms" }
      ]
    };
  }

  // Helper method to generate contact form sections
  private generateContactFormSections() {
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

    const kpis = this.generateKPIs(useCase, customConfig?.customData);
    const charts = this.generateCharts(useCase, customConfig?.customData);
    const segments = this.generateSegments(useCase, customConfig?.customData);

    return {
      templateType: "analytics",
      title: title || "Analytics Dashboard",
      description: description || "Comprehensive analytics dashboard with KPIs, charts, and audience insights",
      theme: theme || "system",
      primaryColor: primaryColor || "#3b82f6",
      fullScreen: fullScreen || false,
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
      kpis: kpis,
      charts: charts,
      segments: segments,
      goals: this.generateGoals(useCase),
      actionButtonText: "Generate Report"
    };
  }

  private generateKPIs(useCase?: string, customData?: Record<string, any>) {
    // If custom analytics KPIs are provided, use them directly
    if (customData?.analyticsKPIs && Array.isArray(customData.analyticsKPIs)) {
      return customData.analyticsKPIs;
    }

    // Website analytics KPIs
    if (useCase?.toLowerCase().includes('website') || useCase?.toLowerCase().includes('web')) {
      return [
        {
          id: "pageViews",
          label: "Page Views",
          value: "124,563",
          change: 23.5,
          changeType: "increase" as const,
          target: "150,000",
          format: "number",
          icon: "eye"
        },
        {
          id: "uniqueVisitors",
          label: "Unique Visitors",
          value: "45,230",
          change: 18.2,
          changeType: "increase" as const,
          target: "50,000",
          format: "number",
          icon: "users"
        },
        {
          id: "bounceRate",
          label: "Bounce Rate",
          value: "32.5%",
          change: -5.2,
          changeType: "decrease" as const,
          target: "25%",
          format: "percentage",
          icon: "trending-down"
        },
        {
          id: "conversionRate",
          label: "Conversion Rate",
          value: "3.2%",
          change: 0.8,
          changeType: "increase" as const,
          target: "4%",
          format: "percentage",
          icon: "target"
        }
      ];
    }

    // E-commerce analytics KPIs
    if (useCase?.toLowerCase().includes('ecommerce') || useCase?.toLowerCase().includes('shop')) {
      return [
        {
          id: "revenue",
          label: "Revenue",
          value: "$124,563",
          change: 23.5,
          changeType: "increase" as const,
          target: "$150,000",
          format: "currency",
          icon: "dollar-sign"
        },
        {
          id: "orders",
          label: "Orders",
          value: "1,847",
          change: 12.3,
          changeType: "increase" as const,
          target: "2,000",
          format: "number",
          icon: "shopping-cart"
        },
        {
          id: "averageOrderValue",
          label: "Average Order Value",
          value: "$67.45",
          change: 5.2,
          changeType: "increase" as const,
          target: "$75",
          format: "currency",
          icon: "bar-chart-3"
        },
        {
          id: "customerLifetimeValue",
          label: "Customer Lifetime Value",
          value: "$450",
          change: 8.7,
          changeType: "increase" as const,
          target: "$500",
          format: "currency",
          icon: "user-check"
        }
      ];
    }

    // Social media analytics KPIs
    if (useCase?.toLowerCase().includes('social') || useCase?.toLowerCase().includes('media')) {
      return [
        {
          id: "followers",
          label: "Followers",
          value: "45,230",
          change: 12.5,
          changeType: "increase" as const,
          target: "50,000",
          format: "number",
          icon: "users"
        },
        {
          id: "engagementRate",
          label: "Engagement Rate",
          value: "4.2%",
          change: 0.8,
          changeType: "increase" as const,
          target: "5%",
          format: "percentage",
          icon: "heart"
        },
        {
          id: "reach",
          label: "Reach",
          value: "125,430",
          change: 18.3,
          changeType: "increase" as const,
          target: "150,000",
          format: "number",
          icon: "eye"
        },
        {
          id: "impressions",
          label: "Impressions",
          value: "234,567",
          change: 15.7,
          changeType: "increase" as const,
          target: "250,000",
          format: "number",
          icon: "trending-up"
        }
      ];
    }

    // Default analytics KPIs
    return [
      {
        id: "revenue",
        label: "Revenue",
        value: "$124,563",
        change: 23.5,
        changeType: "increase" as const,
        target: "$150,000",
        format: "currency",
        icon: "dollar-sign"
      },
      {
        id: "orders",
        label: "Orders",
        value: "1,847",
        change: 12.3,
        changeType: "increase" as const,
        target: "2,000",
        format: "number",
        icon: "shopping-cart"
      },
      {
        id: "conversionRate",
        label: "Conversion Rate",
        value: "3.2%",
        change: 0.8,
        changeType: "increase" as const,
        target: "4%",
        format: "percentage",
        icon: "target"
      },
      {
        id: "averageOrderValue",
        label: "Average Order Value",
        value: "$67.45",
        change: 5.2,
        changeType: "increase" as const,
        target: "$75",
        format: "currency",
        icon: "bar-chart-3"
      }
    ];
  }

  private generateCharts(useCase?: string, customData?: Record<string, any>) {
    // If custom analytics charts are provided, use them directly
    if (customData?.analyticsCharts && Array.isArray(customData.analyticsCharts)) {
      return customData.analyticsCharts;
    }

    // Website analytics charts
    if (useCase?.toLowerCase().includes('website') || useCase?.toLowerCase().includes('web')) {
      return [
        {
          id: "trafficTrend",
          title: "Traffic Trend",
          type: "line" as const,
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Page Views",
                data: [85000, 92000, 105000, 98000, 112000, 124563],
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.1)"
              },
              {
                label: "Unique Visitors",
                data: [32000, 35000, 42000, 38000, 43000, 45230],
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)"
              }
            ]
          },
          insights: ["Steady growth in traffic", "Peak during March", "Mobile traffic increasing"],
          height: 300
        },
        {
          id: "trafficSources",
          title: "Traffic Sources",
          type: "doughnut" as const,
          data: {
            labels: ["Organic Search", "Direct", "Social Media", "Referral", "Email"],
            datasets: [
              {
                label: "Traffic",
                data: [45, 25, 15, 10, 5],
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
              }
            ]
          },
          insights: ["Organic search dominates", "Social media growing", "Email needs improvement"],
          height: 250
        }
      ];
    }

    // E-commerce analytics charts
    if (useCase?.toLowerCase().includes('ecommerce') || useCase?.toLowerCase().includes('shop')) {
      return [
        {
          id: "revenueTrend",
          title: "Revenue Trend",
          type: "line" as const,
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Revenue",
                data: [85000, 92000, 105000, 98000, 112000, 124563],
                borderColor: "#10b981",
                backgroundColor: "rgba(16, 185, 129, 0.1)"
              }
            ]
          },
          insights: ["Consistent growth trend", "Seasonal variations", "23% YoY increase"],
          height: 300
        },
        {
          id: "conversionFunnel",
          title: "Conversion Funnel",
          type: "funnel" as const,
          data: {
            labels: ["Visitors", "Add to Cart", "Checkout", "Purchase"],
            datasets: [
              {
                label: "Conversion",
                data: [100, 45, 23, 18],
                backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]
              }
            ]
          },
          insights: ["45% add to cart rate", "51% checkout completion", "78% purchase rate"],
          height: 250
        }
      ];
    }

    // Social media analytics charts
    if (useCase?.toLowerCase().includes('social') || useCase?.toLowerCase().includes('media')) {
      return [
        {
          id: "followerGrowth",
          title: "Follower Growth",
          type: "line" as const,
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [
              {
                label: "Followers",
                data: [35000, 38000, 42000, 43000, 44000, 45230],
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139, 92, 246, 0.1)"
              }
            ]
          },
          insights: ["Steady follower growth", "Engagement driving growth", "Viral content spikes"],
          height: 300
        },
        {
          id: "engagementByPlatform",
          title: "Engagement by Platform",
          type: "bar" as const,
          data: {
            labels: ["Instagram", "Twitter", "Facebook", "LinkedIn", "TikTok"],
            datasets: [
              {
                label: "Engagement Rate",
                data: [5.2, 3.8, 2.1, 4.5, 6.8],
                backgroundColor: ["#e4405f", "#1da1f2", "#1877f2", "#0077b5", "#000000"]
              }
            ]
          },
          insights: ["TikTok highest engagement", "Instagram strong performer", "Facebook declining"],
          height: 250
        }
      ];
    }

    // Default analytics charts
    return [
      {
        id: "revenueTrend",
        title: "Revenue Trend",
        type: "line" as const,
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Revenue",
              data: [85000, 92000, 105000, 98000, 112000, 124563],
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.1)"
            }
          ]
        },
        insights: ["Consistent growth trend", "Seasonal variations", "23% YoY increase"],
        height: 300
      },
      {
        id: "categoryPerformance",
        title: "Category Performance",
        type: "bar" as const,
        data: {
          labels: ["Electronics", "Clothing", "Home", "Books", "Sports"],
          datasets: [
            {
              label: "Sales",
              data: [45000, 32000, 28000, 12000, 7563],
              backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
            }
          ]
        },
        insights: ["Electronics lead sales", "Clothing strong performer", "Books need attention"],
        height: 250
      }
    ];
  }

  private generateSegments(useCase?: string, customData?: Record<string, any>) {
    // If custom analytics segments are provided, use them directly
    if (customData?.analyticsSegments && Array.isArray(customData.analyticsSegments)) {
      return customData.analyticsSegments;
    }

    // Website analytics segments
    if (useCase?.toLowerCase().includes('website') || useCase?.toLowerCase().includes('web')) {
      return [
        {
          id: "organic-search",
          name: "Organic Search",
          criteria: "Traffic from search engines",
          size: 56000,
          growth: 15.2
        },
        {
          id: "direct-traffic",
          name: "Direct Traffic",
          criteria: "Direct visits and bookmarks",
          size: 31000,
          growth: 8.5
        },
        {
          id: "social-media",
          name: "Social Media",
          criteria: "Traffic from social platforms",
          size: 18700,
          growth: 23.1
        },
        {
          id: "referral",
          name: "Referral",
          criteria: "Traffic from other websites",
          size: 12400,
          growth: 5.8
        }
      ];
    }

    // E-commerce analytics segments
    if (useCase?.toLowerCase().includes('ecommerce') || useCase?.toLowerCase().includes('shop')) {
      return [
        {
          id: "new-customers",
          name: "New Customers",
          criteria: "First-time purchasers",
          size: 1250,
          growth: 18.5
        },
        {
          id: "returning-customers",
          name: "Returning Customers",
          criteria: "Repeat purchasers",
          size: 597,
          growth: 12.3
        },
        {
          id: "high-value",
          name: "High-Value Customers",
          criteria: "Spent >$500 in last 6 months",
          size: 234,
          growth: 25.7
        },
        {
          id: "at-risk",
          name: "At-Risk Customers",
          criteria: "No purchase in last 90 days",
          size: 456,
          growth: -8.2
        }
      ];
    }

    // Social media analytics segments
    if (useCase?.toLowerCase().includes('social') || useCase?.toLowerCase().includes('media')) {
      return [
        {
          id: "engaged-followers",
          name: "Engaged Followers",
          criteria: "Interacted in last 30 days",
          size: 18500,
          growth: 22.1
        },
        {
          id: "inactive-followers",
          name: "Inactive Followers",
          criteria: "No interaction in last 90 days",
          size: 26730,
          growth: -5.3
        },
        {
          id: "brand-advocates",
          name: "Brand Advocates",
          criteria: "Shared content in last 30 days",
          size: 3200,
          growth: 35.8
        },
        {
          id: "new-followers",
          name: "New Followers",
          criteria: "Followed in last 30 days",
          size: 5800,
          growth: 18.9
        }
      ];
    }

    // Default analytics segments
    return [
      {
        id: "active-users",
        name: "Active Users",
        criteria: "Users with activity in last 30 days",
        size: 45000,
        growth: 15.2
      },
      {
        id: "premium-users",
        name: "Premium Users",
        criteria: "Users with premium subscriptions",
        size: 8500,
        growth: 25.7
      },
      {
        id: "new-users",
        name: "New Users",
        criteria: "Users registered in last 30 days",
        size: 12000,
        growth: 18.9
      },
      {
        id: "churned-users",
        name: "Churned Users",
        criteria: "Users inactive for 90+ days",
        size: 8500,
        growth: -8.2
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
