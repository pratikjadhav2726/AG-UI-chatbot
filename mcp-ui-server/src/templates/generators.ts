import { templateSchemas, TemplateType } from "../schemas.js";
import type { TemplateConfig } from "../schemas.js";

export interface TemplateGenerator<T extends TemplateType> {
  // name: string; // Removed as per refactoring
  // description: string; // Removed as per refactoring
  // capabilities: string[]; // Removed as per refactoring
  // useCases: string[]; // Removed as per refactoring
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
  // Static properties removed
  // name = "Dashboard Template";
  // description = "Interactive dashboards with metrics, charts, and activity feeds";
  // capabilities = [
  //   "Real-time metrics display",
  //   "Multiple chart types (line, bar, pie, area)",
  //   "Recent activity feeds",
  //   "Responsive grid layouts",
  //   "Customizable color schemes"
  // ];
  // useCases = [
  //   "Business analytics dashboards",
  //   "Application monitoring",
  //   "Financial reporting",
  //   "Project management overviews",
  //   "Marketing campaign tracking",
  //   "Sales performance monitoring"
  // ];

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
    const generatedMetrics = this.generateMetrics(useCase, customData);
    const generatedCharts = this.generateCharts(useCase, customData);
    const generatedActivity = this.generateActivity(useCase, customData, images);
    const generatedNavigation = this.generateNavigation(useCase, customData);
    // Assuming widgets might not have a dedicated generator function unless specified,
    // so direct customData access or customConfig is primary.
    // const generatedWidgets = this.generateWidgets(useCase, customData); // If we had one

    return {
      // Dynamically generated fields
      name: params.textContent?.title || params.title || "Dynamic Dashboard",
      description: params.textContent?.description || description || `${title} - Comprehensive dashboard with real-time metrics and insights`,
      capabilities: params.customData?.capabilities || this.getDefaultCapabilities(params.useCase),
      useCases: params.customData?.useCases || this.getDefaultUseCases(params.useCase),
      templateType: "dashboard",
      title,
      // description: description || `${title} - Comprehensive dashboard with real-time metrics and insights`, // Original line, replaced by dynamic one
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: "Close",
      layout: customConfig?.layout || customData?.layout || "grid",
      metrics: customConfig?.metrics || customData?.metrics || generatedMetrics,
      charts: customConfig?.charts || customData?.charts || generatedCharts,
      recentActivity: customConfig?.recentActivity || customData?.recentActivity || generatedActivity,
      actionButtonText: customConfig?.actionButtonText || customData?.actionButtonText || "Refresh Data",
      // Enhanced dynamic content
      customData, // Keep customData for other potential uses
      images,
      textContent,
      brandingConfig,
      // New enhanced fields for dashboard
      widgets: customConfig?.widgets || customData?.widgets, // Added customData.widgets
      navigation: customConfig?.navigation || customData?.navigation || generatedNavigation
    };
  }

  private getDefaultCapabilities(useCase?: string): string[] {
    // Example: Derive capabilities based on useCase or return defaults
    const defaultCaps = [
      "Real-time metrics display",
      "Multiple chart types",
      "Activity feeds",
      "Responsive grid layouts",
      "Customizable themes"
    ];
    if (useCase?.toLowerCase().includes("sales")) {
      return [...defaultCaps, "Sales specific KPI tracking"];
    }
    return defaultCaps;
  }

  private getDefaultUseCases(useCase?: string): string[] {
    // Example: Derive use cases or return defaults
    const defaultCases = [
      "Business analytics",
      "Application monitoring",
      "Reporting"
    ];
    if (useCase?.toLowerCase().includes("financial")) {
      return [...defaultCases, "Financial performance tracking"];
    }
    return defaultCases;
  }

  private generateMetrics(useCase?: string, customData?: Record<string, any>) {
    // Prioritize metrics from customData
    if (customData?.metrics && Array.isArray(customData.metrics) && customData.metrics.length > 0) {
      return customData.metrics;
    }

    // Fallback to existing logic
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
    // Prioritize charts from customData
    if (customData?.charts && Array.isArray(customData.charts) && customData.charts.length > 0) {
      return customData.charts;
    }

    // Fallback to existing logic
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
    // Prioritize recentActivity from customData
    if (customData?.recentActivity && Array.isArray(customData.recentActivity) && customData.recentActivity.length > 0) {
      // Optional: Map/validate items and potentially resolve icons or images if needed
      return customData.recentActivity.map((activity: any) => ({
        ...activity,
        // Example: if icon is just a name, but we need to resolve it to a component or URL
        // icon: resolveIcon(activity.icon),
        // Example: if item has an imageId, resolve it from global images
        // imageUrl: activity.imageId && images ? images.find(img => img.id === activity.imageId)?.url : activity.imageUrl
      }));
    }

    // Fallback to existing logic
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

  private generateNavigation(useCase?: string, customData?: Record<string, any>) {
    // Prioritize navigation from customData
    if (customData?.navigation && Array.isArray(customData.navigation) && customData.navigation.length > 0) {
      return customData.navigation;
    }

    // Fallback to existing logic
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
  // Static properties removed
  // name = "Data Table Template";
  // description = "Sortable, filterable data tables with pagination and advanced features";
  // capabilities = [
  //   "Sortable columns",
  //   "Advanced filtering",
  //   "Pagination with customizable page sizes",
  //   "Cell formatters (badges, images, actions)",
  //   "Export functionality",
  //   "Row selection"
  // ];
  // useCases = [
  //   "User management interfaces",
  //   "Product inventory listings",
  //   "Transaction histories",
  //   "Report data display",
  //   "Content management systems",
  //   "Analytics data presentation"
  // ];

  async generate(params: {
    title: string;
    // Added customData, textContent for dynamic properties
    customData?: Record<string, any>;
    textContent?: Record<string, string>;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
  }): Promise<TemplateConfig<"dataTable">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, textContent } = params; // Added customData, textContent

    // Pass customData to helper functions
    const generatedColumns = this.generateColumns(useCase, customData);
    // generateData might depend on columns, so it's called after columns are resolved.
    // If customData.data is provided, it should ideally be used directly.
    const generatedData = this.generateData(customConfig?.columns || customData?.columns || generatedColumns, useCase, customData);
    const generatedFilters = this.generateFilters(useCase, customData);

    const paginationConfig = {
      enabled: true,
      pageSize: 10,
      pageSizeOptions: [5, 10, 20, 50],
      ...(customConfig?.pagination), // Allow customConfig to override parts of pagination
      ...(customData?.pagination) // Allow customData to override parts of pagination
    };

    return {
      // Dynamically generated fields
      name: textContent?.title || params.title || "Dynamic Data Table",
      description: textContent?.description || description || `${title} - Comprehensive data table with sorting and filtering`,
      capabilities: customData?.capabilities || this.getDefaultCapabilities(params.useCase),
      useCases: customData?.useCases || this.getDefaultUseCases(params.useCase),
      templateType: "dataTable",
      title,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: customData?.closeButtonText || textContent?.closeButtonText || "Close",
      columns: customConfig?.columns || customData?.columns || generatedColumns,
      data: customConfig?.data || customData?.data || generatedData,
      pagination: paginationConfig,
      filters: customConfig?.filters || customData?.filters || generatedFilters,
      actionButtonText: customData?.actionButtonText || textContent?.actionButtonText || "Export Data"
    };
  }

  private getDefaultCapabilities(useCase?: string): string[] {
    const defaultCaps = [
      "Sortable columns",
      "Advanced filtering",
      "Pagination",
      "Cell formatters",
      "Export functionality",
      "Row selection"
    ];
    if (useCase?.toLowerCase().includes("inventory")) {
      return [...defaultCaps, "Batch actions", "Stock level indicators"];
    }
    return defaultCaps;
  }

  private getDefaultUseCases(useCase?: string): string[] {
    const defaultCases = [
      "Data display",
      "Management interfaces",
      "Reporting"
    ];
    if (useCase?.toLowerCase().includes("user")) {
      return [...defaultCases, "User listings", "Admin panels"];
    }
    return defaultCases;
  }

  private generateColumns(useCase?: string, customData?: Record<string, any>) {
    if (customData?.columns && Array.isArray(customData.columns) && customData.columns.length > 0) {
      return customData.columns;
    }
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

  private generateData(columns: any[], useCase?: string, customData?: Record<string, any>) {
    if (customData?.data && Array.isArray(customData.data) && customData.data.length > 0) {
      return customData.data;
    }

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

  private generateFilters(useCase?: string, customData?: Record<string, any>) {
    if (customData?.filters && Array.isArray(customData.filters) && customData.filters.length > 0) {
      return customData.filters;
    }
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
  // Static properties removed
  // name = "Product Catalog Template";
  // description = "E-commerce style product listings with filtering and sorting";
  // capabilities = [
  //   "Grid and list view layouts",
  //   "Product filtering by category and attributes",
  //   "Price sorting and filtering",
  //   "Product ratings and reviews",
  //   "Stock status indicators",
  //   "Product badges and labels"
  // ];
  // useCases = [
  //   "E-commerce product listings",
  //   "Digital marketplace catalogs",
  //   "Service offering displays",
  //   "Portfolio showcases",
  //   "Resource libraries",
  //   "Course catalogs"
  // ];

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
      // Dynamically generated fields
      name: params.textContent?.title || params.title || "Dynamic Product Catalog",
      description: params.textContent?.description || description || `${title} - Discover and browse our product collection`,
      capabilities: params.customData?.capabilities || this.getDefaultCapabilities(params.useCase),
      useCases: params.customData?.useCases || this.getDefaultUseCases(params.useCase),
      templateType: "productCatalog",
      title,
      // description: description || `${title} - Discover and browse our product collection`, // Original line
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

  private getDefaultCapabilities(useCase?: string): string[] {
    const defaultCaps = [
      "Grid and list view layouts",
      "Product filtering",
      "Sorting options",
      "Product ratings and reviews",
      "Stock status",
      "Product badges"
    ];
    if (useCase?.toLowerCase().includes("ebook")) {
      return [...defaultCaps, "Digital downloads", "Author pages"];
    }
    return defaultCaps;
  }

  private getDefaultUseCases(useCase?: string): string[] {
    const defaultCases = [
      "E-commerce listings",
      "Marketplace catalogs",
      "Service displays"
    ];
    if (useCase?.toLowerCase().includes("course")) {
      return [...defaultCases, "Online course offerings", "Learning platforms"];
    }
    return defaultCases;
  }

  private generateProducts(useCase?: string, customData?: Record<string, any>, images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>) {
    // Prioritize fully custom product list from customData.products
    if (customData?.products && Array.isArray(customData.products) && customData.products.length > 0) {
      return customData.products.map((product: any) => ({
        id: product.id || `prod-${Math.random().toString(36).substr(2, 9)}`,
        name: product.name || "Unnamed Product",
        description: product.description || "No description available.",
        price: typeof product.price === 'number' ? product.price : 0,
        currency: product.currency || "USD",
        imageUrl: product.imageUrl || (images?.find(img => img.id === product.id || img.category === product.category)?.url) || "/placeholder.jpg?height=300&width=300",
        images: product.images || (images?.filter(img => img.category === product.category || product.imageIds?.includes(img.id)).map(img => img.url)) || [],
        rating: typeof product.rating === 'number' ? product.rating : 0,
        reviewCount: typeof product.reviewCount === 'number' ? product.reviewCount : 0,
        badges: product.badges || [],
        category: product.category || "Uncategorized",
        inStock: typeof product.inStock === 'boolean' ? product.inStock : true,
        ...product.customFields // Spread any additional custom fields
      }));
    }

    // Fallback to existing semi-dynamic/hardcoded logic
    const productImages = images?.filter(img => img.category === 'product') || [];
    
    const defaultProducts = [
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
        imageUrl: productImages[1]?.url || "/placeholder.jpg?height=300&width=300", // Use different image
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
        imageUrl: productImages[2]?.url || "/placeholder.jpg?height=300&width=300", // Use different image
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
        imageUrl: productImages[3]?.url || "/placeholder.jpg?height=300&width=300", // Use different image
        rating: 4.9,
        badges: ["Professional"],
        category: "Photography",
        inStock: true
      }
    ];

    if (useCase?.toLowerCase().includes("digital")) {
      return defaultProducts.map(p => ({
        ...p,
        name: `Digital ${p.name}`,
        description: `Digital version of ${p.description}`,
        price: p.price * 0.7 // Digital products typically cost less
      }));
    }

    return defaultProducts;
  }

  private generateCategories(useCase?: string, customData?: Record<string, any>) {
    // Prioritize fully custom category list from customData.categories
    if (customData?.categories && Array.isArray(customData.categories) && customData.categories.length > 0) {
      return customData.categories.map((category: any) => ({
        id: category.id || `cat-${Math.random().toString(36).substr(2, 9)}`,
        name: category.name || "Unnamed Category",
        imageUrl: category.imageUrl || undefined,
        description: category.description || undefined,
        count: typeof category.count === 'number' ? category.count : 0 // Optional: LLM can provide count
      }));
    }

    // Fallback to existing semi-dynamic/hardcoded logic
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
  // Static properties removed
  // name = "Universal Form Template";
  // description = "Completely flexible forms supporting any field types, layouts, and configurations";
  // capabilities = [
  //   "Any field types (text, select, checkbox, radio, file, etc.)",
  //   "Multi-step wizard forms",
  //   "Single-page forms",
  //   "Custom validation rules",
  //   "Conditional field logic",
  //   "Dynamic field options",
  //   "Custom styling and branding",
  //   "Progress indicators",
  //   "File uploads and previews",
  //   "Custom field layouts",
  //   "Gaming/tournament forms",
  //   "Registration forms",
  //   "Survey forms",
  //   "Application forms"
  // ];
  // useCases = [
  //   "Gaming tournament registration",
  //   "User registration",
  //   "Survey and feedback",
  //   "Job applications",
  //   "Event registration",
  //   "Contact forms",
  //   "Order forms",
  //   "Profile setup",
  //   "Custom business forms"
  // ];

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
      // Dynamically generated fields
      name: params.textContent?.title || params.title || "Dynamic Form",
      description: params.textContent?.description || description || `${title} - Please fill out the form below`,
      capabilities: params.customData?.capabilities || this.getDefaultCapabilities(params.useCase),
      useCases: params.customData?.useCases || this.getDefaultUseCases(params.useCase),
      templateType: "form",
      title,
      // description: description || textContent?.description || `${title} - Please fill out the form below`, // Original line
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

  private getDefaultCapabilities(useCase?: string): string[] {
    const defaultCaps = [
      "Flexible field types",
      "Multi-step/single-page forms",
      "Custom validation",
      "Conditional logic",
      "File uploads",
      "Custom styling"
    ];
    if (useCase?.toLowerCase().includes("survey")) {
      return [...defaultCaps, "Rating scales", "Matrix questions"];
    }
    return defaultCaps;
  }

  private getDefaultUseCases(useCase?: string): string[] {
    const defaultCases = [
      "Registrations",
      "Surveys",
      "Applications",
      "Contact forms"
    ];
    if (useCase?.toLowerCase().includes("gaming")) {
      return [...defaultCases, "Tournament sign-ups", "Team registrations"];
    }
    return defaultCases;
  }

  private generateSections(useCase?: string, customData?: Record<string, any>) {
    // Prioritize fully custom form structure from customData.formSections
    if (customData?.formSections && Array.isArray(customData.formSections) && customData.formSections.length > 0) {
      return customData.formSections;
    }

    // Fallback to existing useCase-based logic
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
              required: false
            },
            {
              id: "hasTeam",
              type: "checkbox" as const,
              label: "Team Status",
              options: [
                { label: "I have a pre-formed team", value: "hasTeam" },
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
  // Static properties removed
  // name = "Analytics Dashboard Template";
  // description = "Comprehensive analytics dashboards with KPIs, charts, and insights";
  // capabilities = [
  //   "KPI tracking and monitoring",
  //   "Multiple chart types with insights",
  //   "Time range selection",
  //   "Audience segmentation",
  //   "Goal tracking",
  //   "Performance comparisons"
  // ];
  // useCases = [
  //   "Website analytics dashboards",
  //   "Marketing campaign analysis",
  //   "Sales performance tracking",
  //   "User behavior analysis",
  //   "Financial reporting",
  //   "Product usage analytics"
  // ];

  async generate(params: {
    title: string;
    // Added customData, textContent for dynamic properties
    customData?: Record<string, any>;
    textContent?: Record<string, string>;
    description?: string;
    useCase?: string;
    customConfig?: any;
    theme?: "light" | "dark" | "system";
    primaryColor?: string;
    fullScreen?: boolean;
  }): Promise<TemplateConfig<"analytics">> {
    const { title, description, useCase, customConfig, theme, primaryColor, fullScreen, customData, textContent } = params;

    const generatedKPIs = this.generateKPIs(useCase, customData);
    const generatedCharts = this.generateCharts(useCase, customData);
    const generatedSegments = this.generateSegments(useCase, customData);
    const generatedGoals = this.generateGoals(useCase, customData);

    const timeRangeConfig = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      presets: [
        { label: "Last 7 days", value: "7d" },
        { label: "Last 30 days", value: "30d" },
        { label: "Last 90 days", value: "90d" },
        { label: "Last 12 months", value: "12m" }
      ],
      ...(customConfig?.timeRange),
      ...(customData?.timeRange)
    };

    return {
      // Dynamically generated fields
      name: textContent?.title || params.title || "Dynamic Analytics Dashboard",
      description: textContent?.description || description || `${title} - Comprehensive analytics and insights`,
      capabilities: customData?.capabilities || this.getDefaultCapabilities(params.useCase),
      useCases: customData?.useCases || this.getDefaultUseCases(params.useCase),
      templateType: "analytics",
      title,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || true, // Analytics often work better full screen
      closeButtonText: customData?.closeButtonText || textContent?.closeButtonText || "Close",
      timeRange: timeRangeConfig,
      kpis: customConfig?.kpis || customData?.kpis || generatedKPIs,
      charts: customConfig?.charts || customData?.charts || generatedCharts,
      segments: customConfig?.segments || customData?.segments || generatedSegments,
      goals: customConfig?.goals || customData?.goals || generatedGoals,
      actionButtonText: customData?.actionButtonText || textContent?.actionButtonText || "Generate Report"
    };
  }

  private getDefaultCapabilities(useCase?: string): string[] {
    const defaultCaps = [
      "KPI tracking",
      "Chart visualizations",
      "Time range filtering",
      "Audience segmentation",
      "Goal tracking",
      "Performance comparisons"
    ];
    if (useCase?.toLowerCase().includes("ecommerce")) {
      return [...defaultCaps, "Sales funnels", "Product performance"];
    }
    return defaultCaps;
  }

  private getDefaultUseCases(useCase?: string): string[] {
    const defaultCases = [
      "Website analytics",
      "Marketing analysis",
      "Sales tracking",
      "User behavior"
    ];
    if (useCase?.toLowerCase().includes("finance")) {
      return [...defaultCases, "Financial performance overview", "Budget tracking"];
    }
    return defaultCases;
  }

  private generateKPIs(useCase?: string, customData?: Record<string, any>) {
    if (customData?.kpis && Array.isArray(customData.kpis) && customData.kpis.length > 0) {
      return customData.kpis;
    }
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

  private generateCharts(useCase?: string, customData?: Record<string, any>) {
    if (customData?.charts && Array.isArray(customData.charts) && customData.charts.length > 0) {
      return customData.charts;
    }
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

  private generateSegments(useCase?: string, customData?: Record<string, any>) {
    if (customData?.segments && Array.isArray(customData.segments) && customData.segments.length > 0) {
      return customData.segments;
    }
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

  private generateGoals(useCase?: string, customData?: Record<string, any>) {
    if (customData?.goals && Array.isArray(customData.goals) && customData.goals.length > 0) {
      return customData.goals;
    }
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
  // Static properties removed
  // name = "Gallery Template";
  // description = "Image galleries with lightbox, filtering, and various layout options";
  // capabilities = [
  //   "Multiple layout types (grid, masonry, carousel)",
  //   "Image lightbox functionality",
  //   "Category-based filtering",
  //   "Metadata display",
  //   "Responsive image handling",
  //   "Custom image URLs"
  // ];
  // useCases = [
  //   "Photography portfolios",
  //   "Product showcases",
  //   "Event photo galleries",
  //   "Art collections",
  //   "Travel photography",
  //   "Real estate listings"
  // ];

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
    const generatedItems = this.generateGalleryItems(useCase, images, customData, brandingConfig);
    // Categories should be generated based on the items if not provided directly
    const generatedCategories = this.generateCategories(useCase, images, customData, customConfig?.items || customData?.items || generatedItems);
    // Filters should be based on the final categories
    const finalCategories = customConfig?.categories || customData?.categories || generatedCategories;
    const generatedFilters = this.generateFilters(finalCategories); // Pass final categories to generateFilters

    return {
      // Dynamically generated fields
      name: params.textContent?.title || params.title || "Dynamic Image Gallery",
      description: params.textContent?.description || description || `${title} - A curated collection of stunning imagery`,
      capabilities: params.customData?.capabilities || this.getDefaultCapabilities(params.useCase),
      useCases: params.customData?.useCases || this.getDefaultUseCases(params.useCase),
      templateType: "gallery",
      title,
      theme: theme || "system",
      primaryColor,
      fullScreen: fullScreen || false,
      closeButtonText: customData?.closeButtonText || params.textContent?.closeButtonText || "Close",
      layout: customConfig?.layout || customData?.layout || "grid",
      items: customConfig?.items || customData?.items || generatedItems,
      categories: finalCategories,
      lightbox: customConfig?.lightbox ?? customData?.lightbox ?? true,
      columns: customConfig?.columns || customData?.columns || 3,
      aspectRatio: customConfig?.aspectRatio || customData?.aspectRatio || "auto",
      spacing: customConfig?.spacing || customData?.spacing || 4,
      filters: customConfig?.filters || customData?.filters || generatedFilters,
      sortOptions: customConfig?.sortOptions || customData?.sortOptions || [
        { label: "Date", value: "date" },
        { label: "Title", value: "title" },
        { label: "Category", value: "category" }
      ],
      // Enhanced dynamic content
      customData, // Keep customData for other potential uses
      images,
      textContent,
      brandingConfig
    };
  }

  private getDefaultCapabilities(useCase?: string): string[] {
    const defaultCaps = [
      "Multiple layout options (grid, masonry, carousel)",
      "Image lightbox",
      "Category filtering",
      "Metadata display",
      "Responsive images"
    ];
    if (useCase?.toLowerCase().includes("portfolio")) {
      return [...defaultCaps, "Artist bios", "Social sharing"];
    }
    return defaultCaps;
  }

  private getDefaultUseCases(useCase?: string): string[] {
    const defaultCases = [
      "Photography display",
      "Product showcases",
      "Event galleries",
      "Art collections"
    ];
    if (useCase?.toLowerCase().includes("real estate")) {
      return [...defaultCases, "Property listings", "Virtual tours (image-based)"];
    }
    return defaultCases;
  }

  private generateGalleryItems(
    useCase?: string,
    images?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>,
    customData?: Record<string, any>,
    brandingConfig?: { logoUrl?: string; brandName?: string; brandColors?: string[]; fontFamily?: string }
  ) {
    // Prioritize items from customData
    if (customData?.items && Array.isArray(customData.items) && customData.items.length > 0) {
      return customData.items.map((item: any) => ({
        id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
        title: item.title || "Untitled Image",
        description: item.description || "",
        imageUrl: item.imageUrl || "/placeholder.jpg?height=400&width=600",
        thumbnailUrl: item.thumbnailUrl || item.imageUrl || "/placeholder.jpg?height=200&width=300",
        highResUrl: item.highResUrl || item.imageUrl || "/placeholder.jpg?height=800&width=1200",
        category: item.category || "uncategorized",
        tags: item.tags || [],
        date: item.date || new Date().toISOString(),
        author: item.author || brandingConfig?.brandName || "Unknown Artist",
        location: item.location || "Unknown Location",
        dimensions: item.dimensions || { width: 0, height: 0 },
        metadata: item.metadata || {},
        likes: item.likes || 0,
        views: item.views || 0,
        socialShare: item.socialShare ?? true,
        ...item.customFields
      }));
    }

    // Fallback: Use provided global images parameter if available
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

  private generateCategories(
    useCase?: string,
    // Global images param can still be used if customData.items doesn't have enough category info
    globalImages?: Array<{ id: string; url: string; alt?: string; caption?: string; category?: string }>,
    customData?: Record<string, any>,
    // Pass generated/provided items to extract categories if customData.categories is not set
    itemsToCategorize?: Array<any>
  ) {
    // Prioritize categories from customData
    if (customData?.categories && Array.isArray(customData.categories) && customData.categories.length > 0) {
      return customData.categories.map((cat: any) => ({
        id: cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-') || `cat-${Math.random().toString(36).substr(2, 9)}`,
        name: cat.name || "Unnamed Category",
        imageUrl: cat.imageUrl,
        description: cat.description,
        count: cat.count || (itemsToCategorize ? itemsToCategorize.filter(item => item.category === cat.name || item.category === cat.id).length : 0)
      }));
    }

    // Fallback: Extract categories from itemsToCategorize (which could be from customData.items or generated)
    const sourceForCategories = itemsToCategorize || globalImages;
    if (sourceForCategories && sourceForCategories.length > 0) {
      const categoriesMap = new Map<string, { id: string; name: string; imageUrl?: string; description?: string; count: number }>();
      sourceForCategories.forEach(item => {
        const categoryName = item.category;
        if (categoryName && typeof categoryName === 'string') {
          if (!categoriesMap.has(categoryName)) {
            categoriesMap.set(categoryName, {
              id: categoryName.toLowerCase().replace(/\s+/g, '-'),
              name: categoryName,
              // Attempt to find an image for the category from the first item in that category
              imageUrl: item.imageUrl || item.thumbnailUrl,
              description: `Content related to ${categoryName}`,
              count: 0
            });
          }
          categoriesMap.get(categoryName)!.count++;
        }
      });
      if (categoriesMap.size > 0) return Array.from(categoriesMap.values());
    }

    // Default categories based on use case (last resort)
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

  private generateFilters(categories: any[] = []) { // Ensure categories can be empty
    if (categories.length === 0) {
      return []; // No filters if no categories
    }
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
