/**
 * Data Table Generator - Dynamic table templates with advanced features
 */

import { z } from 'zod';
import type { TemplateGenerator } from '../engine.js';
import type { TemplateGenerationParams } from '../../types/mcp.js';

// Column configuration schema
const ColumnSchema = z.object({
  id: z.string(),
  accessorKey: z.string(),
  header: z.string(),
  type: z.enum(['text', 'number', 'date', 'boolean', 'enum', 'image', 'link', 'badge', 'progress', 'avatar', 'actions']).default('text'),
  sortable: z.boolean().default(true),
  filterable: z.boolean().default(true),
  width: z.union([z.number(), z.string()]).optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional(),
  align: z.enum(['left', 'center', 'right']).default('left'),
  fixed: z.enum(['left', 'right']).optional(),
  hidden: z.boolean().default(false),
  format: z.object({
    type: z.enum(['currency', 'percentage', 'date', 'datetime', 'number']).optional(),
    options: z.record(z.any()).optional()
  }).optional(),
  enum: z.array(z.object({
    value: z.any(),
    label: z.string(),
    color: z.string().optional(),
    icon: z.string().optional()
  })).optional(),
  render: z.object({
    component: z.string().optional(),
    props: z.record(z.any()).optional()
  }).optional()
});

// Filter configuration schema
const FilterSchema = z.object({
  id: z.string(),
  column: z.string(),
  type: z.enum(['text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean']),
  label: z.string(),
  placeholder: z.string().optional(),
  options: z.array(z.object({
    value: z.any(),
    label: z.string()
  })).optional(),
  defaultValue: z.any().optional()
});

// Action configuration schema
const ActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost', 'destructive']).default('outline'),
  size: z.enum(['sm', 'md', 'lg']).default('sm'),
  href: z.string().optional(),
  onClick: z.string().optional(),
  disabled: z.boolean().default(false),
  showInDropdown: z.boolean().default(false),
  confirm: z.object({
    title: z.string(),
    description: z.string(),
    confirmText: z.string().default('Confirm'),
    cancelText: z.string().default('Cancel')
  }).optional()
});

// Data table configuration schema
const DataTableConfigSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  columns: z.array(ColumnSchema),
  data: z.array(z.record(z.any())).default([]),
  features: z.object({
    sorting: z.object({
      enabled: z.boolean().default(true),
      multiSort: z.boolean().default(false),
      defaultSort: z.array(z.object({
        column: z.string(),
        direction: z.enum(['asc', 'desc'])
      })).optional()
    }),
    filtering: z.object({
      enabled: z.boolean().default(true),
      global: z.boolean().default(true),
      globalPlaceholder: z.string().default('Search...'),
      columnFilters: z.array(FilterSchema).default([])
    }),
    pagination: z.object({
      enabled: z.boolean().default(true),
      pageSize: z.number().default(10),
      pageSizeOptions: z.array(z.number()).default([5, 10, 20, 50, 100]),
      showTotal: z.boolean().default(true),
      showPageInfo: z.boolean().default(true)
    }),
    selection: z.object({
      enabled: z.boolean().default(false),
      type: z.enum(['single', 'multiple']).default('multiple'),
      selectAll: z.boolean().default(true),
      onSelectionChange: z.string().optional()
    }),
    export: z.object({
      enabled: z.boolean().default(false),
      formats: z.array(z.enum(['csv', 'excel', 'pdf', 'json'])).default(['csv']),
      filename: z.string().optional()
    }),
    refresh: z.object({
      enabled: z.boolean().default(false),
      interval: z.number().optional(),
      onRefresh: z.string().optional()
    })
  }),
  actions: z.object({
    row: z.array(ActionSchema).default([]),
    bulk: z.array(ActionSchema).default([]),
    toolbar: z.array(ActionSchema).default([])
  }),
  styling: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    size: z.enum(['sm', 'md', 'lg']).default('md'),
    bordered: z.boolean().default(true),
    striped: z.boolean().default(false),
    hover: z.boolean().default(true),
    compact: z.boolean().default(false),
    stickyHeader: z.boolean().default(false),
    maxHeight: z.string().optional(),
    className: z.string().optional()
  }),
  responsive: z.object({
    enabled: z.boolean().default(true),
    breakpoint: z.enum(['sm', 'md', 'lg', 'xl']).default('md'),
    stackedLayout: z.boolean().default(true),
    hiddenColumns: z.record(z.array(z.string())).optional()
  }),
  loading: z.object({
    enabled: z.boolean().default(false),
    skeleton: z.boolean().default(true),
    rows: z.number().default(5)
  }),
  empty: z.object({
    title: z.string().default('No data available'),
    description: z.string().default('There are no items to display'),
    icon: z.string().optional(),
    action: ActionSchema.optional()
  })
});

type DataTableConfig = z.infer<typeof DataTableConfigSchema>;

export class DataTableGenerator implements TemplateGenerator<DataTableConfig> {
  name = 'Dynamic Data Table Generator';
  description = 'Generate feature-rich data tables with sorting, filtering, pagination, and responsive design';
  capabilities = [
    'Advanced sorting',
    'Column filtering',
    'Global search',
    'Pagination',
    'Row selection',
    'Export functionality',
    'Responsive design',
    'Custom actions',
    'Real-time updates',
    'Custom cell rendering'
  ];
  useCases = [
    'User management tables',
    'Product listings',
    'Order management',
    'Analytics dashboards',
    'Inventory systems',
    'Customer databases',
    'Financial data',
    'Project management',
    'Content management',
    'Admin panels'
  ];
  schema = DataTableConfigSchema;

  async generate(params: TemplateGenerationParams): Promise<DataTableConfig> {
    // Use custom table data if provided
    if (params.customData?.table) {
      return this.validateAndEnhanceCustomTable(params.customData.table);
    }

    // Generate table based on use case
    return this.generateTableByUseCase(params);
  }

  async validate(config: DataTableConfig): Promise<boolean> {
    try {
      DataTableConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  async getExamples(): Promise<DataTableConfig[]> {
    return [
      await this.generateUserTable(),
      await this.generateProductTable(),
      await this.generateOrderTable(),
      await this.generateAnalyticsTable()
    ];
  }

  private validateAndEnhanceCustomTable(customTable: any): DataTableConfig {
    const validated = DataTableConfigSchema.parse(customTable);
    return this.enhanceTableWithDefaults(validated);
  }

  private generateTableByUseCase(params: TemplateGenerationParams): DataTableConfig {
    const useCase = params.useCase?.toLowerCase() || '';
    const title = params.title || 'Data Table';

    if (useCase.includes('user') || useCase.includes('member') || useCase.includes('customer')) {
      return this.generateUserTable(title);
    } else if (useCase.includes('product') || useCase.includes('inventory') || useCase.includes('catalog')) {
      return this.generateProductTable(title);
    } else if (useCase.includes('order') || useCase.includes('transaction') || useCase.includes('purchase')) {
      return this.generateOrderTable(title);
    } else if (useCase.includes('analytics') || useCase.includes('metrics') || useCase.includes('performance')) {
      return this.generateAnalyticsTable(title);
    } else if (useCase.includes('project') || useCase.includes('task')) {
      return this.generateProjectTable(title);
    } else if (useCase.includes('financial') || useCase.includes('invoice') || useCase.includes('payment')) {
      return this.generateFinancialTable(title);
    } else if (useCase.includes('content') || useCase.includes('article') || useCase.includes('post')) {
      return this.generateContentTable(title);
    } else {
      return this.generateGenericTable(title, params);
    }
  }

  private generateUserTable(title: string = 'Users'): DataTableConfig {
    return {
      id: 'users-table',
      title,
      description: 'Manage user accounts and permissions',
      columns: [
        {
          id: 'avatar',
          accessorKey: 'avatar',
          header: '',
          type: 'avatar',
          width: 60,
          sortable: false,
          filterable: false
        },
        {
          id: 'name',
          accessorKey: 'name',
          header: 'Name',
          type: 'text',
          sortable: true,
          filterable: true,
          minWidth: 150
        },
        {
          id: 'email',
          accessorKey: 'email',
          header: 'Email',
          type: 'text',
          sortable: true,
          filterable: true,
          minWidth: 200
        },
        {
          id: 'role',
          accessorKey: 'role',
          header: 'Role',
          type: 'badge',
          sortable: true,
          filterable: true,
          enum: [
            { value: 'admin', label: 'Admin', color: 'red' },
            { value: 'editor', label: 'Editor', color: 'blue' },
            { value: 'user', label: 'User', color: 'green' },
            { value: 'guest', label: 'Guest', color: 'gray' }
          ]
        },
        {
          id: 'status',
          accessorKey: 'status',
          header: 'Status',
          type: 'badge',
          sortable: true,
          filterable: true,
          enum: [
            { value: 'active', label: 'Active', color: 'green' },
            { value: 'inactive', label: 'Inactive', color: 'gray' },
            { value: 'suspended', label: 'Suspended', color: 'red' }
          ]
        },
        {
          id: 'lastLogin',
          accessorKey: 'lastLogin',
          header: 'Last Login',
          type: 'date',
          sortable: true,
          filterable: true,
          format: {
            type: 'datetime',
            options: { relative: true }
          }
        },
        {
          id: 'createdAt',
          accessorKey: 'createdAt',
          header: 'Created',
          type: 'date',
          sortable: true,
          filterable: true,
          format: {
            type: 'date'
          }
        },
        {
          id: 'actions',
          accessorKey: 'actions',
          header: 'Actions',
          type: 'actions',
          width: 120,
          sortable: false,
          filterable: false,
          fixed: 'right'
        }
      ],
      data: this.generateSampleUserData(),
      features: {
        sorting: {
          enabled: true,
          multiSort: true,
          defaultSort: [{ column: 'name', direction: 'asc' }]
        },
        filtering: {
          enabled: true,
          global: true,
          globalPlaceholder: 'Search users...',
          columnFilters: [
            {
              id: 'role-filter',
              column: 'role',
              type: 'select',
              label: 'Role',
              options: [
                { value: 'admin', label: 'Admin' },
                { value: 'editor', label: 'Editor' },
                { value: 'user', label: 'User' },
                { value: 'guest', label: 'Guest' }
              ]
            },
            {
              id: 'status-filter',
              column: 'status',
              type: 'select',
              label: 'Status',
              options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' }
              ]
            }
          ]
        },
        pagination: {
          enabled: true,
          pageSize: 20,
          pageSizeOptions: [10, 20, 50, 100],
          showTotal: true,
          showPageInfo: true
        },
        selection: {
          enabled: true,
          type: 'multiple',
          selectAll: true
        },
        export: {
          enabled: true,
          formats: ['csv', 'excel'],
          filename: 'users-export'
        },
        refresh: {
          enabled: true,
          onRefresh: 'refreshUsers'
        }
      },
      actions: {
        row: [
          {
            id: 'view',
            label: 'View',
            icon: 'Eye',
            variant: 'ghost',
            onClick: 'viewUser'
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: 'Edit',
            variant: 'ghost',
            onClick: 'editUser'
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'Trash',
            variant: 'destructive',
            onClick: 'deleteUser',
            showInDropdown: true,
            confirm: {
              title: 'Delete User',
              description: 'Are you sure you want to delete this user? This action cannot be undone.'
            }
          }
        ],
        bulk: [
          {
            id: 'bulk-delete',
            label: 'Delete Selected',
            icon: 'Trash',
            variant: 'destructive',
            onClick: 'bulkDeleteUsers',
            confirm: {
              title: 'Delete Users',
              description: 'Are you sure you want to delete the selected users?'
            }
          },
          {
            id: 'bulk-export',
            label: 'Export Selected',
            icon: 'Download',
            variant: 'outline',
            onClick: 'bulkExportUsers'
          }
        ],
        toolbar: [
          {
            id: 'add-user',
            label: 'Add User',
            icon: 'Plus',
            variant: 'primary',
            onClick: 'addUser'
          }
        ]
      },
      styling: {
        theme: 'auto',
        size: 'md',
        bordered: true,
        striped: false,
        hover: true,
        stickyHeader: true
      },
      responsive: {
        enabled: true,
        breakpoint: 'md',
        stackedLayout: true,
        hiddenColumns: {
          sm: ['createdAt', 'lastLogin'],
          xs: ['createdAt', 'lastLogin', 'role']
        }
      },
      loading: {
        enabled: false,
        skeleton: true,
        rows: 10
      },
      empty: {
        title: 'No users found',
        description: 'Get started by adding your first user',
        icon: 'Users',
        action: {
          id: 'add-first-user',
          label: 'Add User',
          icon: 'Plus',
          variant: 'primary',
          onClick: 'addUser'
        }
      }
    };
  }

  private generateProductTable(title: string = 'Products'): DataTableConfig {
    return {
      id: 'products-table',
      title,
      description: 'Manage your product inventory',
      columns: [
        {
          id: 'image',
          accessorKey: 'image',
          header: 'Image',
          type: 'image',
          width: 80,
          sortable: false,
          filterable: false
        },
        {
          id: 'name',
          accessorKey: 'name',
          header: 'Product Name',
          type: 'text',
          sortable: true,
          filterable: true,
          minWidth: 200
        },
        {
          id: 'sku',
          accessorKey: 'sku',
          header: 'SKU',
          type: 'text',
          sortable: true,
          filterable: true,
          width: 120
        },
        {
          id: 'category',
          accessorKey: 'category',
          header: 'Category',
          type: 'badge',
          sortable: true,
          filterable: true,
          enum: [
            { value: 'electronics', label: 'Electronics', color: 'blue' },
            { value: 'clothing', label: 'Clothing', color: 'green' },
            { value: 'books', label: 'Books', color: 'purple' },
            { value: 'home', label: 'Home & Garden', color: 'orange' }
          ]
        },
        {
          id: 'price',
          accessorKey: 'price',
          header: 'Price',
          type: 'number',
          sortable: true,
          filterable: true,
          align: 'right',
          format: {
            type: 'currency',
            options: { currency: 'USD' }
          }
        },
        {
          id: 'stock',
          accessorKey: 'stock',
          header: 'Stock',
          type: 'number',
          sortable: true,
          filterable: true,
          align: 'center'
        },
        {
          id: 'status',
          accessorKey: 'status',
          header: 'Status',
          type: 'badge',
          sortable: true,
          filterable: true,
          enum: [
            { value: 'active', label: 'Active', color: 'green' },
            { value: 'draft', label: 'Draft', color: 'gray' },
            { value: 'out-of-stock', label: 'Out of Stock', color: 'red' }
          ]
        },
        {
          id: 'actions',
          accessorKey: 'actions',
          header: 'Actions',
          type: 'actions',
          width: 120,
          sortable: false,
          filterable: false,
          fixed: 'right'
        }
      ],
      data: this.generateSampleProductData(),
      features: {
        sorting: {
          enabled: true,
          multiSort: false,
          defaultSort: [{ column: 'name', direction: 'asc' }]
        },
        filtering: {
          enabled: true,
          global: true,
          globalPlaceholder: 'Search products...',
          columnFilters: [
            {
              id: 'category-filter',
              column: 'category',
              type: 'select',
              label: 'Category',
              options: [
                { value: 'electronics', label: 'Electronics' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'books', label: 'Books' },
                { value: 'home', label: 'Home & Garden' }
              ]
            },
            {
              id: 'price-filter',
              column: 'price',
              type: 'range',
              label: 'Price Range'
            }
          ]
        },
        pagination: {
          enabled: true,
          pageSize: 15,
          pageSizeOptions: [10, 15, 25, 50],
          showTotal: true,
          showPageInfo: true
        },
        selection: {
          enabled: true,
          type: 'multiple',
          selectAll: true
        },
        export: {
          enabled: true,
          formats: ['csv', 'excel'],
          filename: 'products-export'
        },
        refresh: {
          enabled: true,
          onRefresh: 'refreshProducts'
        }
      },
      actions: {
        row: [
          {
            id: 'edit',
            label: 'Edit',
            icon: 'Edit',
            variant: 'ghost',
            onClick: 'editProduct'
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: 'Copy',
            variant: 'ghost',
            onClick: 'duplicateProduct'
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'Trash',
            variant: 'destructive',
            showInDropdown: true,
            onClick: 'deleteProduct',
            confirm: {
              title: 'Delete Product',
              description: 'Are you sure you want to delete this product?'
            }
          }
        ],
        bulk: [
          {
            id: 'bulk-update-status',
            label: 'Update Status',
            icon: 'RefreshCw',
            variant: 'outline',
            onClick: 'bulkUpdateStatus'
          }
        ],
        toolbar: [
          {
            id: 'add-product',
            label: 'Add Product',
            icon: 'Plus',
            variant: 'primary',
            onClick: 'addProduct'
          },
          {
            id: 'import',
            label: 'Import',
            icon: 'Upload',
            variant: 'outline',
            onClick: 'importProducts'
          }
        ]
      },
      styling: {
        theme: 'auto',
        size: 'md',
        bordered: true,
        striped: true,
        hover: true,
        stickyHeader: true
      },
      responsive: {
        enabled: true,
        breakpoint: 'lg',
        stackedLayout: true
      },
      loading: {
        enabled: false,
        skeleton: true,
        rows: 8
      },
      empty: {
        title: 'No products found',
        description: 'Start building your product catalog',
        icon: 'Package',
        action: {
          id: 'add-first-product',
          label: 'Add Product',
          icon: 'Plus',
          variant: 'primary',
          onClick: 'addProduct'
        }
      }
    };
  }

  private generateOrderTable(title: string = 'Orders'): DataTableConfig {
    return {
      id: 'orders-table',
      title,
      description: 'Track and manage customer orders',
      columns: [
        {
          id: 'orderNumber',
          accessorKey: 'orderNumber',
          header: 'Order #',
          type: 'link',
          sortable: true,
          filterable: true,
          width: 120
        },
        {
          id: 'customer',
          accessorKey: 'customer',
          header: 'Customer',
          type: 'text',
          sortable: true,
          filterable: true,
          minWidth: 150
        },
        {
          id: 'date',
          accessorKey: 'date',
          header: 'Order Date',
          type: 'date',
          sortable: true,
          filterable: true,
          format: {
            type: 'date'
          }
        },
        {
          id: 'status',
          accessorKey: 'status',
          header: 'Status',
          type: 'badge',
          sortable: true,
          filterable: true,
          enum: [
            { value: 'pending', label: 'Pending', color: 'yellow' },
            { value: 'processing', label: 'Processing', color: 'blue' },
            { value: 'shipped', label: 'Shipped', color: 'purple' },
            { value: 'delivered', label: 'Delivered', color: 'green' },
            { value: 'cancelled', label: 'Cancelled', color: 'red' }
          ]
        },
        {
          id: 'total',
          accessorKey: 'total',
          header: 'Total',
          type: 'number',
          sortable: true,
          filterable: true,
          align: 'right',
          format: {
            type: 'currency',
            options: { currency: 'USD' }
          }
        },
        {
          id: 'items',
          accessorKey: 'items',
          header: 'Items',
          type: 'number',
          sortable: true,
          filterable: false,
          align: 'center'
        },
        {
          id: 'actions',
          accessorKey: 'actions',
          header: 'Actions',
          type: 'actions',
          width: 120,
          sortable: false,
          filterable: false,
          fixed: 'right'
        }
      ],
      data: this.generateSampleOrderData(),
      features: {
        sorting: {
          enabled: true,
          multiSort: false,
          defaultSort: [{ column: 'date', direction: 'desc' }]
        },
        filtering: {
          enabled: true,
          global: true,
          globalPlaceholder: 'Search orders...',
          columnFilters: [
            {
              id: 'status-filter',
              column: 'status',
              type: 'multiselect',
              label: 'Status',
              options: [
                { value: 'pending', label: 'Pending' },
                { value: 'processing', label: 'Processing' },
                { value: 'shipped', label: 'Shipped' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' }
              ]
            },
            {
              id: 'date-filter',
              column: 'date',
              type: 'date',
              label: 'Order Date'
            }
          ]
        },
        pagination: {
          enabled: true,
          pageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
          showTotal: true,
          showPageInfo: true
        },
        selection: {
          enabled: true,
          type: 'multiple',
          selectAll: true
        },
        export: {
          enabled: true,
          formats: ['csv', 'excel', 'pdf'],
          filename: 'orders-export'
        },
        refresh: {
          enabled: true,
          interval: 30000,
          onRefresh: 'refreshOrders'
        }
      },
      actions: {
        row: [
          {
            id: 'view',
            label: 'View Details',
            icon: 'Eye',
            variant: 'ghost',
            onClick: 'viewOrder'
          },
          {
            id: 'print',
            label: 'Print',
            icon: 'Printer',
            variant: 'ghost',
            onClick: 'printOrder'
          },
          {
            id: 'cancel',
            label: 'Cancel Order',
            icon: 'X',
            variant: 'destructive',
            showInDropdown: true,
            onClick: 'cancelOrder',
            confirm: {
              title: 'Cancel Order',
              description: 'Are you sure you want to cancel this order?'
            }
          }
        ],
        bulk: [
          {
            id: 'bulk-update-status',
            label: 'Update Status',
            icon: 'RefreshCw',
            variant: 'outline',
            onClick: 'bulkUpdateOrderStatus'
          },
          {
            id: 'bulk-export',
            label: 'Export Selected',
            icon: 'Download',
            variant: 'outline',
            onClick: 'bulkExportOrders'
          }
        ],
        toolbar: [
          {
            id: 'create-order',
            label: 'Create Order',
            icon: 'Plus',
            variant: 'primary',
            onClick: 'createOrder'
          }
        ]
      },
      styling: {
        theme: 'auto',
        size: 'md',
        bordered: true,
        striped: false,
        hover: true,
        stickyHeader: true
      },
      responsive: {
        enabled: true,
        breakpoint: 'lg',
        stackedLayout: true,
        hiddenColumns: {
          md: ['items'],
          sm: ['items', 'date']
        }
      },
      loading: {
        enabled: false,
        skeleton: true,
        rows: 12
      },
      empty: {
        title: 'No orders found',
        description: 'Orders will appear here when customers make purchases',
        icon: 'ShoppingCart'
      }
    };
  }

  private generateAnalyticsTable(title: string = 'Analytics Data'): DataTableConfig {
    return {
      id: 'analytics-table',
      title,
      description: 'View performance metrics and analytics',
      columns: [
        {
          id: 'metric',
          accessorKey: 'metric',
          header: 'Metric',
          type: 'text',
          sortable: true,
          filterable: true,
          minWidth: 180
        },
        {
          id: 'value',
          accessorKey: 'value',
          header: 'Current Value',
          type: 'number',
          sortable: true,
          filterable: true,
          align: 'right',
          format: {
            type: 'number',
            options: { notation: 'compact' }
          }
        },
        {
          id: 'change',
          accessorKey: 'change',
          header: 'Change',
          type: 'number',
          sortable: true,
          filterable: true,
          align: 'right',
          format: {
            type: 'percentage'
          }
        },
        {
          id: 'trend',
          accessorKey: 'trend',
          header: 'Trend',
          type: 'progress',
          sortable: false,
          filterable: false,
          width: 100
        },
        {
          id: 'category',
          accessorKey: 'category',
          header: 'Category',
          type: 'badge',
          sortable: true,
          filterable: true,
          enum: [
            { value: 'traffic', label: 'Traffic', color: 'blue' },
            { value: 'conversion', label: 'Conversion', color: 'green' },
            { value: 'revenue', label: 'Revenue', color: 'purple' },
            { value: 'engagement', label: 'Engagement', color: 'orange' }
          ]
        },
        {
          id: 'lastUpdated',
          accessorKey: 'lastUpdated',
          header: 'Last Updated',
          type: 'date',
          sortable: true,
          filterable: true,
          format: {
            type: 'datetime',
            options: { relative: true }
          }
        }
      ],
      data: this.generateSampleAnalyticsData(),
      features: {
        sorting: {
          enabled: true,
          multiSort: true,
          defaultSort: [{ column: 'category', direction: 'asc' }]
        },
        filtering: {
          enabled: true,
          global: true,
          globalPlaceholder: 'Search metrics...',
          columnFilters: [
            {
              id: 'category-filter',
              column: 'category',
              type: 'select',
              label: 'Category',
              options: [
                { value: 'traffic', label: 'Traffic' },
                { value: 'conversion', label: 'Conversion' },
                { value: 'revenue', label: 'Revenue' },
                { value: 'engagement', label: 'Engagement' }
              ]
            }
          ]
        },
        pagination: {
          enabled: true,
          pageSize: 20,
          pageSizeOptions: [10, 20, 50],
          showTotal: true,
          showPageInfo: true
        },
        selection: {
          enabled: false,
          type: 'single'
        },
        export: {
          enabled: true,
          formats: ['csv', 'excel'],
          filename: 'analytics-export'
        },
        refresh: {
          enabled: true,
          interval: 60000,
          onRefresh: 'refreshAnalytics'
        }
      },
      actions: {
        row: [
          {
            id: 'view-details',
            label: 'View Details',
            icon: 'BarChart',
            variant: 'ghost',
            onClick: 'viewMetricDetails'
          }
        ],
        bulk: [],
        toolbar: [
          {
            id: 'refresh-all',
            label: 'Refresh All',
            icon: 'RefreshCw',
            variant: 'outline',
            onClick: 'refreshAllMetrics'
          }
        ]
      },
      styling: {
        theme: 'auto',
        size: 'md',
        bordered: true,
        striped: true,
        hover: true,
        stickyHeader: true
      },
      responsive: {
        enabled: true,
        breakpoint: 'md',
        stackedLayout: true,
        hiddenColumns: {
          sm: ['lastUpdated'],
          xs: ['lastUpdated', 'trend']
        }
      },
      loading: {
        enabled: false,
        skeleton: true,
        rows: 15
      },
      empty: {
        title: 'No metrics available',
        description: 'Analytics data will appear here once configured',
        icon: 'BarChart'
      }
    };
  }

  private generateProjectTable(title: string = 'Projects'): DataTableConfig {
    // Implementation similar to above patterns
    return this.generateGenericTable(title, { templateType: 'dataTable', title, useCase: 'project management' });
  }

  private generateFinancialTable(title: string = 'Financial Data'): DataTableConfig {
    // Implementation similar to above patterns
    return this.generateGenericTable(title, { templateType: 'dataTable', title, useCase: 'financial tracking' });
  }

  private generateContentTable(title: string = 'Content'): DataTableConfig {
    // Implementation similar to above patterns
    return this.generateGenericTable(title, { templateType: 'dataTable', title, useCase: 'content management' });
  }

  private generateGenericTable(title: string, params: TemplateGenerationParams): DataTableConfig {
    const columnCount = params.customData?.columnCount || 5;
    const columns = [];

    for (let i = 0; i < columnCount; i++) {
      columns.push({
        id: `column_${i}`,
        accessorKey: `column_${i}`,
        header: `Column ${i + 1}`,
        type: 'text' as const,
        sortable: true,
        filterable: true
      });
    }

    return {
      id: 'generic-table',
      title,
      description: 'A dynamically generated data table',
      columns,
      data: [],
      features: {
        sorting: { enabled: true, multiSort: false },
        filtering: { enabled: true, global: true, globalPlaceholder: 'Search...', columnFilters: [] },
        pagination: { enabled: true, pageSize: 10, pageSizeOptions: [5, 10, 20, 50], showTotal: true, showPageInfo: true },
        selection: { enabled: false, type: 'multiple', selectAll: true },
        export: { enabled: false, formats: ['csv'], filename: 'export' },
        refresh: { enabled: false }
      },
      actions: { row: [], bulk: [], toolbar: [] },
      styling: { theme: 'auto', size: 'md', bordered: true, striped: false, hover: true, stickyHeader: false },
      responsive: { enabled: true, breakpoint: 'md', stackedLayout: true },
      loading: { enabled: false, skeleton: true, rows: 5 },
      empty: { title: 'No data available', description: 'Data will appear here when available' }
    };
  }

  private enhanceTableWithDefaults(table: DataTableConfig): DataTableConfig {
    // Add any missing default values or enhancements
    return table;
  }

  // Sample data generators
  private generateSampleUserData() {
    return [
      {
        id: '1',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: new Date('2024-01-15T10:30:00Z'),
        createdAt: new Date('2023-06-01T00:00:00Z')
      },
      {
        id: '2',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b000?w=150',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'editor',
        status: 'active',
        lastLogin: new Date('2024-01-14T15:20:00Z'),
        createdAt: new Date('2023-07-15T00:00:00Z')
      }
    ];
  }

  private generateSampleProductData() {
    return [
      {
        id: '1',
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150',
        name: 'Wireless Headphones',
        sku: 'WH-001',
        category: 'electronics',
        price: 199.99,
        stock: 45,
        status: 'active'
      },
      {
        id: '2',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=150',
        name: 'Cotton T-Shirt',
        sku: 'CT-002',
        category: 'clothing',
        price: 29.99,
        stock: 0,
        status: 'out-of-stock'
      }
    ];
  }

  private generateSampleOrderData() {
    return [
      {
        id: '1',
        orderNumber: 'ORD-001',
        customer: 'John Doe',
        date: new Date('2024-01-15T00:00:00Z'),
        status: 'delivered',
        total: 299.98,
        items: 2
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        customer: 'Jane Smith',
        date: new Date('2024-01-14T00:00:00Z'),
        status: 'processing',
        total: 149.99,
        items: 1
      }
    ];
  }

  private generateSampleAnalyticsData() {
    return [
      {
        id: '1',
        metric: 'Page Views',
        value: 125000,
        change: 12.5,
        trend: 85,
        category: 'traffic',
        lastUpdated: new Date('2024-01-15T12:00:00Z')
      },
      {
        id: '2',
        metric: 'Conversion Rate',
        value: 3.2,
        change: -5.1,
        trend: 65,
        category: 'conversion',
        lastUpdated: new Date('2024-01-15T11:30:00Z')
      }
    ];
  }
}