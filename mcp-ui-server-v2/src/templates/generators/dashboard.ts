/**
 * Dashboard Template Generator
 * Generates comprehensive dashboard templates with metrics, charts, and activity feeds
 */

import { z } from 'zod';
import type { TemplateGenerationParams } from '../../types/mcp.js';
import type { TemplateGenerator } from '../engine.js';
import { getLogger } from '../../core/logger.js';

// Dashboard-specific schema
const DashboardSchema = z.object({
  templateType: z.literal('dashboard'),
  title: z.string(),
  description: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  primaryColor: z.string().optional(),
  fullScreen: z.boolean().default(false),
  
  // Dashboard-specific fields
  layout: z.enum(['grid', 'columns', 'rows']).default('grid'),
  metrics: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    change: z.number().optional(),
    changeType: z.enum(['increase', 'decrease', 'neutral']).optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    description: z.string().optional(),
    target: z.number().optional(),
    unit: z.string().optional(),
    trendData: z.array(z.number()).optional()
  })),
  
  charts: z.array(z.object({
    id: z.string(),
    type: z.enum(['line', 'bar', 'pie', 'area', 'scatter', 'radar']),
    title: z.string(),
    description: z.string().optional(),
    data: z.object({
      labels: z.array(z.string()),
      datasets: z.array(z.object({
        label: z.string(),
        data: z.array(z.number()),
        backgroundColor: z.union([z.string(), z.array(z.string())]).optional(),
        borderColor: z.string().optional(),
        fill: z.boolean().optional()
      }))
    }),
    options: z.record(z.any()).optional()
  })),
  
  recentActivity: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    description: z.string(),
    timestamp: z.string(),
    user: z.object({
      name: z.string(),
      avatar: z.string().optional()
    }).optional(),
    status: z.enum(['success', 'warning', 'error', 'info']).optional(),
    icon: z.string().optional()
  })).optional(),
  
  widgets: z.array(z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    size: z.enum(['small', 'medium', 'large']).default('medium'),
    position: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number()
    }).optional(),
    config: z.record(z.any()).optional()
  })).optional(),
  
  navigation: z.object({
    items: z.array(z.object({
      id: z.string(),
      label: z.string(),
      icon: z.string().optional(),
      href: z.string().optional(),
      active: z.boolean().default(false)
    })),
    showSearch: z.boolean().default(true),
    showNotifications: z.boolean().default(true),
    showProfile: z.boolean().default(true)
  }).optional(),
  
  filters: z.object({
    timeRange: z.object({
      options: z.array(z.string()),
      default: z.string()
    }).optional(),
    categories: z.array(z.string()).optional(),
    customFilters: z.array(z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['select', 'multi-select', 'date', 'range']),
      options: z.array(z.string()).optional()
    })).optional()
  }).optional()
});

type DashboardConfig = z.infer<typeof DashboardSchema>;

export class DashboardGenerator implements TemplateGenerator<DashboardConfig> {
  name = 'Dynamic Dashboard Generator';
  description = 'Creates comprehensive dashboards with real-time metrics, interactive charts, and activity feeds';
  capabilities = [
    'Real-time metrics display',
    'Multiple chart types (line, bar, pie, area, scatter, radar)',
    'Customizable layouts (grid, columns, rows)',
    'Recent activity feeds with user context',
    'Interactive widgets with drag-and-drop support',
    'Advanced filtering and time range selection',
    'Responsive design with mobile optimization',
    'Custom color schemes and theming',
    'Dynamic data binding and updates',
    'Export and sharing capabilities'
  ];
  useCases = [
    'Business analytics dashboards',
    'Application monitoring and DevOps',
    'Financial reporting and KPI tracking',
    'Project management overviews',
    'Marketing campaign performance',
    'Sales performance monitoring',
    'Customer success dashboards',
    'Operational efficiency tracking',
    'E-commerce analytics',
    'Social media monitoring'
  ];
  
  schema = DashboardSchema;
  private logger = getLogger();

  async generate(params: TemplateGenerationParams): Promise<DashboardConfig> {
    this.logger.debug('Generating dashboard template', {
      title: params.title,
      useCase: params.useCase
    });

    // Generate base configuration
    const config: DashboardConfig = {
      templateType: 'dashboard',
      title: params.title,
      description: params.description || `${params.title} - Comprehensive dashboard with real-time insights`,
      theme: params.theme || 'system',
      primaryColor: params.primaryColor,
      fullScreen: params.fullScreen || false,
      layout: this.determineLayout(params),
      metrics: await this.generateMetrics(params),
      charts: await this.generateCharts(params),
      recentActivity: await this.generateActivity(params),
      widgets: await this.generateWidgets(params),
      navigation: await this.generateNavigation(params),
      filters: await this.generateFilters(params)
    };

    return config;
  }

  async validate(config: DashboardConfig): Promise<boolean> {
    try {
      DashboardSchema.parse(config);
      return true;
    } catch (error) {
      this.logger.warn('Dashboard validation failed', { error });
      return false;
    }
  }

  async getExamples(): Promise<DashboardConfig[]> {
    return [
      await this.generate({
        templateType: 'dashboard',
        title: 'Sales Performance Dashboard',
        description: 'Track sales metrics and team performance',
        useCase: 'sales tracking for e-commerce business',
        theme: 'light'
      }),
      await this.generate({
        templateType: 'dashboard',
        title: 'DevOps Monitoring',
        description: 'Monitor application health and infrastructure',
        useCase: 'application monitoring and alerts',
        theme: 'dark'
      }),
      await this.generate({
        templateType: 'dashboard',
        title: 'Marketing Analytics',
        description: 'Track campaign performance and ROI',
        useCase: 'marketing campaign analysis',
        theme: 'system'
      })
    ];
  }

  private determineLayout(params: TemplateGenerationParams): 'grid' | 'columns' | 'rows' {
    if (params.customData?.layout) {
      return params.customData.layout as 'grid' | 'columns' | 'rows';
    }

    // Determine layout based on use case
    const useCase = params.useCase?.toLowerCase() || '';
    
    if (useCase.includes('monitoring') || useCase.includes('devops')) {
      return 'rows'; // Better for monitoring data
    }
    
    if (useCase.includes('financial') || useCase.includes('accounting')) {
      return 'columns'; // Better for financial data
    }
    
    return 'grid'; // Default flexible layout
  }

  private async generateMetrics(params: TemplateGenerationParams): Promise<DashboardConfig['metrics']> {
    // Use custom metrics if provided
    if (params.customData?.metrics && Array.isArray(params.customData.metrics)) {
      return params.customData.metrics;
    }

    const useCase = params.useCase?.toLowerCase() || '';
    
    // Generate metrics based on use case
    if (useCase.includes('sales') || useCase.includes('revenue')) {
      return this.generateSalesMetrics();
    }
    
    if (useCase.includes('marketing') || useCase.includes('campaign')) {
      return this.generateMarketingMetrics();
    }
    
    if (useCase.includes('devops') || useCase.includes('monitoring')) {
      return this.generateDevOpsMetrics();
    }
    
    if (useCase.includes('financial') || useCase.includes('finance')) {
      return this.generateFinancialMetrics();
    }
    
    if (useCase.includes('ecommerce') || useCase.includes('e-commerce')) {
      return this.generateEcommerceMetrics();
    }
    
    // Default business metrics
    return this.generateDefaultMetrics();
  }

  private generateSalesMetrics(): DashboardConfig['metrics'] {
    return [
      {
        id: 'total-revenue',
        label: 'Total Revenue',
        value: '$124,530',
        change: 12.5,
        changeType: 'increase',
        icon: 'DollarSign',
        color: 'green',
        unit: '$',
        target: 150000,
        trendData: [95000, 105000, 110000, 118000, 124530]
      },
      {
        id: 'new-customers',
        label: 'New Customers',
        value: 1247,
        change: 8.2,
        changeType: 'increase',
        icon: 'Users',
        color: 'blue',
        target: 1500,
        trendData: [1100, 1150, 1200, 1220, 1247]
      },
      {
        id: 'conversion-rate',
        label: 'Conversion Rate',
        value: '3.24%',
        change: -0.3,
        changeType: 'decrease',
        icon: 'TrendingUp',
        color: 'orange',
        unit: '%',
        target: 3.5,
        trendData: [3.1, 3.3, 3.4, 3.3, 3.24]
      },
      {
        id: 'avg-order-value',
        label: 'Avg Order Value',
        value: '$89.50',
        change: 5.7,
        changeType: 'increase',
        icon: 'ShoppingCart',
        color: 'purple',
        unit: '$',
        target: 95,
        trendData: [82, 84, 87, 88, 89.5]
      }
    ];
  }

  private generateMarketingMetrics(): DashboardConfig['metrics'] {
    return [
      {
        id: 'website-traffic',
        label: 'Website Traffic',
        value: 45230,
        change: 15.3,
        changeType: 'increase',
        icon: 'Globe',
        color: 'blue',
        target: 50000,
        trendData: [38000, 40000, 42000, 43500, 45230]
      },
      {
        id: 'lead-generation',
        label: 'Leads Generated',
        value: 892,
        change: 22.1,
        changeType: 'increase',
        icon: 'Target',
        color: 'green',
        target: 1000,
        trendData: [650, 720, 780, 850, 892]
      },
      {
        id: 'cost-per-click',
        label: 'Cost Per Click',
        value: '$2.45',
        change: -8.5,
        changeType: 'increase',
        icon: 'MousePointer',
        color: 'green',
        unit: '$',
        target: 2.0,
        trendData: [2.8, 2.7, 2.6, 2.5, 2.45]
      },
      {
        id: 'email-open-rate',
        label: 'Email Open Rate',
        value: '24.8%',
        change: 3.2,
        changeType: 'increase',
        icon: 'Mail',
        color: 'purple',
        unit: '%',
        target: 25,
        trendData: [22.1, 23.5, 24.0, 24.3, 24.8]
      }
    ];
  }

  private generateDevOpsMetrics(): DashboardConfig['metrics'] {
    return [
      {
        id: 'system-uptime',
        label: 'System Uptime',
        value: '99.94%',
        change: 0.02,
        changeType: 'increase',
        icon: 'Activity',
        color: 'green',
        unit: '%',
        target: 99.9,
        trendData: [99.89, 99.91, 99.93, 99.92, 99.94]
      },
      {
        id: 'response-time',
        label: 'Avg Response Time',
        value: '245ms',
        change: -12.3,
        changeType: 'increase',
        icon: 'Zap',
        color: 'green',
        unit: 'ms',
        target: 200,
        trendData: [280, 270, 260, 250, 245]
      },
      {
        id: 'error-rate',
        label: 'Error Rate',
        value: '0.12%',
        change: -45.5,
        changeType: 'increase',
        icon: 'AlertTriangle',
        color: 'green',
        unit: '%',
        target: 0.1,
        trendData: [0.22, 0.18, 0.15, 0.13, 0.12]
      },
      {
        id: 'cpu-usage',
        label: 'CPU Usage',
        value: '67%',
        change: 5.2,
        changeType: 'decrease',
        icon: 'Cpu',
        color: 'orange',
        unit: '%',
        target: 70,
        trendData: [62, 64, 65, 66, 67]
      }
    ];
  }

  private generateFinancialMetrics(): DashboardConfig['metrics'] {
    return [
      {
        id: 'total-assets',
        label: 'Total Assets',
        value: '$2.4M',
        change: 7.8,
        changeType: 'increase',
        icon: 'Briefcase',
        color: 'blue',
        unit: '$',
        trendData: [2.1, 2.2, 2.25, 2.35, 2.4]
      },
      {
        id: 'monthly-profit',
        label: 'Monthly Profit',
        value: '$45,230',
        change: 12.4,
        changeType: 'increase',
        icon: 'TrendingUp',
        color: 'green',
        unit: '$',
        target: 50000,
        trendData: [38000, 40000, 42000, 43500, 45230]
      },
      {
        id: 'expense-ratio',
        label: 'Expense Ratio',
        value: '23.5%',
        change: -2.1,
        changeType: 'increase',
        icon: 'PieChart',
        color: 'green',
        unit: '%',
        target: 20,
        trendData: [26.2, 25.8, 24.9, 24.1, 23.5]
      },
      {
        id: 'cash-flow',
        label: 'Cash Flow',
        value: '$12,850',
        change: 18.7,
        changeType: 'increase',
        icon: 'DollarSign',
        color: 'purple',
        unit: '$',
        trendData: [9800, 10200, 11000, 11800, 12850]
      }
    ];
  }

  private generateEcommerceMetrics(): DashboardConfig['metrics'] {
    return [
      {
        id: 'total-orders',
        label: 'Total Orders',
        value: 1852,
        change: 16.3,
        changeType: 'increase',
        icon: 'ShoppingBag',
        color: 'blue',
        target: 2000,
        trendData: [1450, 1580, 1680, 1750, 1852]
      },
      {
        id: 'cart-abandonment',
        label: 'Cart Abandonment',
        value: '68.2%',
        change: -4.7,
        changeType: 'increase',
        icon: 'ShoppingCart',
        color: 'green',
        unit: '%',
        target: 65,
        trendData: [72.1, 71.3, 70.5, 69.1, 68.2]
      },
      {
        id: 'product-views',
        label: 'Product Views',
        value: 24680,
        change: 28.9,
        changeType: 'increase',
        icon: 'Eye',
        color: 'purple',
        target: 30000,
        trendData: [18000, 19500, 21000, 22800, 24680]
      },
      {
        id: 'return-rate',
        label: 'Return Rate',
        value: '2.8%',
        change: -12.5,
        changeType: 'increase',
        icon: 'RotateCcw',
        color: 'green',
        unit: '%',
        target: 2.5,
        trendData: [3.5, 3.2, 3.0, 2.9, 2.8]
      }
    ];
  }

  private generateDefaultMetrics(): DashboardConfig['metrics'] {
    return [
      {
        id: 'total-users',
        label: 'Total Users',
        value: 12480,
        change: 8.5,
        changeType: 'increase',
        icon: 'Users',
        color: 'blue',
        target: 15000,
        trendData: [10200, 10800, 11400, 11900, 12480]
      },
      {
        id: 'active-sessions',
        label: 'Active Sessions',
        value: 847,
        change: 12.3,
        changeType: 'increase',
        icon: 'Activity',
        color: 'green',
        target: 1000,
        trendData: [680, 720, 760, 800, 847]
      },
      {
        id: 'completion-rate',
        label: 'Completion Rate',
        value: '76.4%',
        change: 3.8,
        changeType: 'increase',
        icon: 'CheckCircle',
        color: 'purple',
        unit: '%',
        target: 80,
        trendData: [71.2, 73.5, 74.8, 75.6, 76.4]
      },
      {
        id: 'satisfaction-score',
        label: 'Satisfaction Score',
        value: '4.6/5',
        change: 2.2,
        changeType: 'increase',
        icon: 'Star',
        color: 'orange',
        target: 4.8,
        trendData: [4.3, 4.4, 4.5, 4.5, 4.6]
      }
    ];
  }

  private async generateCharts(params: TemplateGenerationParams): Promise<DashboardConfig['charts']> {
    if (params.customData?.charts && Array.isArray(params.customData.charts)) {
      return params.customData.charts;
    }

    const useCase = params.useCase?.toLowerCase() || '';
    
    // Generate charts based on use case
    const charts: DashboardConfig['charts'] = [
      {
        id: 'trend-chart',
        type: 'line',
        title: 'Performance Trend',
        description: 'Track performance over time',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Performance',
            data: [65, 78, 82, 88, 92, 95],
            borderColor: params.primaryColor || '#3b82f6',
            backgroundColor: `${params.primaryColor || '#3b82f6'}20`,
            fill: true
          }]
        }
      }
    ];

    if (useCase.includes('sales') || useCase.includes('revenue')) {
      charts.push({
        id: 'revenue-breakdown',
        type: 'pie',
        title: 'Revenue by Category',
        data: {
          labels: ['Product Sales', 'Services', 'Subscriptions', 'Other'],
          datasets: [{
            label: 'Revenue',
            data: [45, 25, 20, 10],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
          }]
        }
      });
    }

    return charts;
  }

  private async generateActivity(params: TemplateGenerationParams): Promise<DashboardConfig['recentActivity']> {
    if (params.customData?.recentActivity && Array.isArray(params.customData.recentActivity)) {
      return params.customData.recentActivity;
    }

    return [
      {
        id: 'activity-1',
        type: 'user_action',
        title: 'New user registered',
        description: 'john.doe@example.com completed registration',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        user: {
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'
        },
        status: 'success',
        icon: 'UserPlus'
      },
      {
        id: 'activity-2',
        type: 'system_event',
        title: 'System backup completed',
        description: 'Daily backup process finished successfully',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'info',
        icon: 'Database'
      },
      {
        id: 'activity-3',
        type: 'alert',
        title: 'High CPU usage detected',
        description: 'Server load exceeded 80% threshold',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'warning',
        icon: 'AlertTriangle'
      }
    ];
  }

  private async generateWidgets(params: TemplateGenerationParams): Promise<DashboardConfig['widgets']> {
    if (params.customData?.widgets && Array.isArray(params.customData.widgets)) {
      return params.customData.widgets;
    }

    return [
      {
        id: 'quick-stats',
        type: 'stats',
        title: 'Quick Stats',
        size: 'small',
        position: { x: 0, y: 0, width: 4, height: 2 }
      },
      {
        id: 'performance-chart',
        type: 'chart',
        title: 'Performance Overview',
        size: 'large',
        position: { x: 4, y: 0, width: 8, height: 4 }
      }
    ];
  }

  private async generateNavigation(params: TemplateGenerationParams): Promise<DashboardConfig['navigation']> {
    if (params.customData?.navigation) {
      return params.customData.navigation as any;
    }

    const useCase = params.useCase?.toLowerCase() || '';
    
    let items = [
      { id: 'overview', label: 'Overview', icon: 'Home', active: true },
      { id: 'analytics', label: 'Analytics', icon: 'BarChart', active: false },
      { id: 'reports', label: 'Reports', icon: 'FileText', active: false },
      { id: 'settings', label: 'Settings', icon: 'Settings', active: false }
    ];

    if (useCase.includes('sales')) {
      items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'Home', active: true },
        { id: 'sales', label: 'Sales', icon: 'TrendingUp', active: false },
        { id: 'customers', label: 'Customers', icon: 'Users', active: false },
        { id: 'products', label: 'Products', icon: 'Package', active: false },
        { id: 'reports', label: 'Reports', icon: 'FileText', active: false }
      ];
    }

    return {
      items,
      showSearch: true,
      showNotifications: true,
      showProfile: true
    };
  }

  private async generateFilters(params: TemplateGenerationParams): Promise<DashboardConfig['filters']> {
    if (params.customData?.filters) {
      return params.customData.filters;
    }

    return {
      timeRange: {
        options: ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last year', 'Custom range'],
        default: 'Last 30 days'
      },
      categories: ['All', 'Sales', 'Marketing', 'Operations', 'Finance'],
      customFilters: [
        {
          id: 'region',
          label: 'Region',
          type: 'select',
          options: ['All Regions', 'North America', 'Europe', 'Asia Pacific', 'Latin America']
        },
        {
          id: 'team',
          label: 'Team',
          type: 'multi-select',
          options: ['Sales Team', 'Marketing Team', 'Product Team', 'Support Team']
        }
      ]
    };
  }
}