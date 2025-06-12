import { templateSchemas, TemplateType, TemplateConfig } from "../schemas.js";
import { 
  DashboardGenerator, 
  DataTableGenerator, 
  ProductCatalogGenerator,
  FormGenerator,
  AnalyticsGenerator,
  TemplateGenerator
} from "./generators.js";

// Template registry
export const templates: Record<TemplateType, TemplateGenerator<any>> = {
  dashboard: new DashboardGenerator(),
  dataTable: new DataTableGenerator(),
  productCatalog: new ProductCatalogGenerator(),
  form: new FormGenerator(),
  analytics: new AnalyticsGenerator(),
  
  // Placeholder generators for other template types
  // These would be implemented similarly to the above
  profileCard: {
    name: "Profile Card Template",
    description: "User profile cards with contact information and social links",
    capabilities: ["Contact information display", "Social media links", "Avatar and cover images", "Statistics display"],
    useCases: ["User profiles", "Team member showcases", "Speaker profiles", "Author bios"],
    async generate(params) {
      return {
        templateType: "profileCard",
        title: params.title,
        description: params.description || "User profile card",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        profile: {
          name: "John Doe",
          title: "Software Engineer",
          company: "Tech Corp",
          bio: "Passionate developer with 5+ years of experience in web technologies.",
          avatarUrl: "/placeholder.jpg?height=150&width=150",
          location: "San Francisco, CA",
          email: "john.doe@example.com",
          socialLinks: [
            { platform: "Twitter", url: "https://twitter.com/johndoe", icon: "Twitter" },
            { platform: "LinkedIn", url: "https://linkedin.com/in/johndoe", icon: "Linkedin" },
            { platform: "GitHub", url: "https://github.com/johndoe", icon: "Github" }
          ],
          stats: [
            { label: "Projects", value: 42 },
            { label: "Followers", value: "1.2K" },
            { label: "Years Experience", value: 5 }
          ]
        },
        actions: [
          { label: "Contact", action: "contact", variant: "default", icon: "Mail" },
          { label: "Follow", action: "follow", variant: "outline", icon: "UserPlus" }
        ]
      };
    }
  },
  
  timeline: {
    name: "Timeline Template",
    description: "Event timelines with media support and filtering",
    capabilities: ["Chronological event display", "Media attachments", "Event filtering", "Responsive layouts"],
    useCases: ["Project milestones", "Company history", "Event schedules", "Process flows"],
    async generate(params) {
      return {
        templateType: "timeline",
        title: params.title,
        description: params.description || "Timeline of events",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        layout: "vertical",
        events: [
          {
            id: "event-1",
            title: "Project Kickoff",
            description: "Initial project planning and team formation",
            date: "2024-01-15T10:00:00Z",
            category: "milestone",
            icon: "Rocket"
          },
          {
            id: "event-2",
            title: "Design Phase Complete",
            description: "UI/UX designs approved and ready for development",
            date: "2024-02-20T15:00:00Z",
            category: "milestone",
            icon: "Palette"
          },
          {
            id: "event-3",
            title: "Beta Release",
            description: "First beta version released to select users",
            date: "2024-03-30T12:00:00Z",
            category: "release",
            icon: "Package"
          }
        ],
        filters: [
          {
            id: "category",
            label: "Category",
            type: "category",
            options: [
              { label: "All", value: "all" },
              { label: "Milestones", value: "milestone" },
              { label: "Releases", value: "release" }
            ]
          }
        ]
      };
    }
  },
  
  gallery: {
    name: "Gallery Template",
    description: "Image and media galleries with lightbox functionality",
    capabilities: ["Multiple layout options", "Lightbox viewing", "Category filtering", "Responsive grids"],
    useCases: ["Photo galleries", "Portfolio showcases", "Product images", "Media libraries"],
    async generate(params) {
      return {
        templateType: "gallery",
        title: params.title,
        description: params.description || "Image gallery",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        layout: "grid",
        items: [
          {
            id: "img-1",
            title: "Sunset Landscape",
            imageUrl: "/placeholder.jpg?height=400&width=600",
            category: "nature",
            tags: ["sunset", "landscape", "photography"]
          },
          {
            id: "img-2",
            title: "City Architecture",
            imageUrl: "/placeholder.jpg?height=400&width=600",
            category: "architecture",
            tags: ["city", "building", "modern"]
          }
        ],
        categories: [
          { id: "nature", name: "Nature" },
          { id: "architecture", name: "Architecture" }
        ],
        lightbox: true,
        columns: 3
      };
    }
  },
  
  pricing: {
    name: "Pricing Template", 
    description: "Pricing plans and comparison tables",
    capabilities: ["Multiple pricing plans", "Feature comparisons", "Popular plan highlighting", "Call-to-action buttons"],
    useCases: ["SaaS pricing pages", "Service packages", "Subscription tiers", "Product comparisons"],
    async generate(params) {
      return {
        templateType: "pricing",
        title: params.title,
        description: params.description || "Choose the perfect plan for you",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        currency: "USD",
        interval: "monthly",
        plans: [
          {
            id: "basic",
            name: "Basic",
            description: "Perfect for individuals getting started",
            price: 9.99,
            features: [
              { text: "Up to 5 projects", included: true },
              { text: "2GB storage", included: true },
              { text: "Email support", included: true },
              { text: "Advanced analytics", included: false }
            ],
            cta: { text: "Get Started", action: "subscribe_basic" }
          },
          {
            id: "pro",
            name: "Pro",
            description: "Best for growing teams and businesses",
            price: 29.99,
            popular: true,
            features: [
              { text: "Unlimited projects", included: true },
              { text: "50GB storage", included: true },
              { text: "Priority support", included: true },
              { text: "Advanced analytics", included: true }
            ],
            cta: { text: "Start Free Trial", action: "subscribe_pro" }
          }
        ]
      };
    }
  },
  
  stats: {
    name: "Statistics Template",
    description: "KPI and statistics displays with charts",
    capabilities: ["Multiple stat layouts", "Progress indicators", "Trend visualizations", "Comparative metrics"],
    useCases: ["KPI dashboards", "Performance metrics", "Progress tracking", "Business intelligence"],
    async generate(params) {
      return {
        templateType: "stats",
        title: params.title,
        description: params.description || "Key performance indicators",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        layout: "grid",
        stats: [
          {
            id: "users",
            label: "Total Users",
            value: "12,458",
            change: 12.5,
            changeType: "increase",
            icon: "Users",
            color: "#3b82f6"
          },
          {
            id: "revenue",
            label: "Revenue",
            value: "$45,210",
            change: 8.2,
            changeType: "increase",
            icon: "DollarSign",
            color: "#10b981"
          }
        ],
        columns: 2
      };
    }
  },
  
  calendar: {
    name: "Calendar Template",
    description: "Event calendars with scheduling functionality",
    capabilities: ["Multiple view modes", "Event management", "Category filtering", "Date navigation"],
    useCases: ["Event scheduling", "Appointment booking", "Meeting planning", "Content calendars"],
    async generate(params) {
      return {
        templateType: "calendar",
        title: params.title,
        description: params.description || "Event calendar",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        view: "month",
        events: [
          {
            id: "event-1",
            title: "Team Meeting",
            start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            category: "meeting",
            color: "#3b82f6"
          }
        ],
        categories: [
          { id: "meeting", name: "Meetings", color: "#3b82f6" },
          { id: "deadline", name: "Deadlines", color: "#ef4444" }
        ],
        selectable: true
      };
    }
  },
  
  wizard: {
    name: "Wizard Template",
    description: "Multi-step forms and processes",
    capabilities: ["Step-by-step navigation", "Progress tracking", "Form validation", "Conditional logic"],
    useCases: ["Onboarding flows", "Setup wizards", "Multi-step forms", "Guided processes"],
    async generate(params) {
      return {
        templateType: "wizard",
        title: params.title,
        description: params.description || "Complete the steps below",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        steps: [
          {
            id: "step-1",
            title: "Basic Information",
            description: "Tell us about yourself",
            fields: [
              {
                id: "name",
                type: "text",
                label: "Full Name",
                required: true
              },
              {
                id: "email",
                type: "email",
                label: "Email Address",
                required: true
              }
            ]
          },
          {
            id: "step-2",
            title: "Preferences",
            description: "Set your preferences",
            fields: [
              {
                id: "notifications",
                type: "checkbox",
                label: "Email Notifications",
                options: [
                  { label: "Marketing", value: "marketing" },
                  { label: "Updates", value: "updates" }
                ]
              }
            ]
          }
        ],
        showStepIndicator: true,
        allowBack: true
      };
    }
  },
  
  chart: {
    name: "Chart Template",
    description: "Data visualization charts and graphs",
    capabilities: ["Multiple chart types", "Interactive legends", "Data filtering", "Export functionality"],
    useCases: ["Data visualization", "Report charts", "Analytics displays", "Performance tracking"],
    async generate(params) {
      return {
        templateType: "chart",
        title: params.title,
        description: params.description || "Data visualization",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        chartType: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [{
            label: "Sales",
            data: [12, 19, 3, 5, 2, 3],
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)"
          }]
        },
        options: {
          responsive: true,
          showLegend: true,
          showGrid: true
        },
        height: 400
      };
    }
  },
  
  map: {
    name: "Map Template",
    description: "Interactive maps with markers and overlays",
    capabilities: ["Interactive maps", "Custom markers", "Polygon overlays", "Location search"],
    useCases: ["Store locators", "Event maps", "Geographic data", "Route planning"],
    async generate(params) {
      return {
        templateType: "map",
        title: params.title,
        description: params.description || "Interactive map",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        markers: [
          {
            id: "marker-1",
            position: { lat: 37.7749, lng: -122.4194 },
            title: "San Francisco",
            description: "Beautiful city by the bay"
          }
        ],
        showControls: true,
        mapType: "roadmap",
        height: 400
      };
    }
  },
  
  kanban: {
    name: "Kanban Board Template",
    description: "Task management boards with drag-and-drop",
    capabilities: ["Drag-and-drop functionality", "Task categorization", "Progress tracking", "Assignment management"],
    useCases: ["Project management", "Task tracking", "Workflow management", "Team collaboration"],
    async generate(params) {
      return {
        templateType: "kanban",
        title: params.title,
        description: params.description || "Task management board",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        columns: [
          {
            id: "todo",
            title: "To Do",
            cards: [
              {
                id: "task-1",
                title: "Design new homepage",
                description: "Create mockups for the new homepage design",
                labels: [{ text: "Design", color: "#3b82f6" }],
                priority: "high"
              }
            ]
          },
          {
            id: "in-progress",
            title: "In Progress",
            cards: [
              {
                id: "task-2",
                title: "Implement user authentication",
                description: "Add login and signup functionality",
                labels: [{ text: "Development", color: "#10b981" }],
                priority: "medium"
              }
            ]
          },
          {
            id: "done",
            title: "Done",
            cards: []
          }
        ],
        allowDragAndDrop: true,
        showCardCount: true
      };
    }
  },
  
  feed: {
    name: "Activity Feed Template",
    description: "Social media style activity feeds",
    capabilities: ["Post display", "Media attachments", "Comments and likes", "Real-time updates"],
    useCases: ["Social feeds", "Activity logs", "News feeds", "Update streams"],
    async generate(params) {
      return {
        templateType: "feed",
        title: params.title,
        description: params.description || "Activity feed",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        posts: [
          {
            id: "post-1",
            author: {
              name: "John Doe",
              avatarUrl: "/placeholder.jpg?height=40&width=40",
              title: "Software Engineer"
            },
            content: "Just shipped a new feature! Excited to see how users respond.",
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            likes: 12,
            tags: ["development", "feature"]
          }
        ],
        layout: "timeline",
        allowComments: true,
        allowLikes: true
      };
    }
  },

  marketplace: {
    name: "Marketplace Template",
    description: "Multi-vendor marketplace with advanced filtering",
    capabilities: ["Seller profiles", "Advanced filtering", "Reviews and ratings", "Location-based search"],
    useCases: ["Online marketplaces", "Service directories", "Classified ads", "Multi-vendor platforms"],
    async generate(params) {
      return {
        templateType: "marketplace",
        title: params.title,
        description: params.description || "Discover amazing products and services",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        items: [
          {
            id: "item-1",
            title: "Vintage Camera",
            description: "Classic 35mm film camera in excellent condition",
            price: 299,
            seller: {
              name: "Photography Pro",
              rating: 4.8,
              verified: true
            },
            category: "Electronics",
            rating: 4.6,
            reviewCount: 23,
            condition: "like-new",
            location: "San Francisco, CA"
          }
        ],
        categories: [
          { id: "electronics", name: "Electronics", icon: "Monitor" },
          { id: "fashion", name: "Fashion", icon: "Shirt" }
        ],
        layout: "grid"
      };
    }
  },

  ecommerce: {
    name: "E-commerce Template",
    description: "Full-featured e-commerce product displays",
    capabilities: ["Product variants", "Shopping cart", "Wishlist", "Product comparison"],
    useCases: ["Online stores", "Product catalogs", "Shopping platforms", "Retail websites"],
    async generate(params) {
      return {
        templateType: "ecommerce",
        title: params.title,
        description: params.description || "Shop our amazing products",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        products: [
          {
            id: "prod-1",
            name: "Wireless Headphones",
            description: "Premium wireless headphones with noise cancellation",
            price: 299.99,
            images: ["/placeholder.jpg?height=400&width=400"],
            category: "Electronics",
            rating: 4.8,
            reviewCount: 156,
            stock: 25,
            featured: true
          }
        ],
        cart: { enabled: true },
        wishlist: { enabled: true },
        comparison: { enabled: true, maxItems: 3 }
      };
    }
  },

  blog: {
    name: "Blog Template",
    description: "Blog layouts with posts, categories, and authors",
    capabilities: ["Post management", "Category organization", "Author profiles", "SEO optimization"],
    useCases: ["Company blogs", "Personal blogs", "News sites", "Content publishing"],
    async generate(params) {
      return {
        templateType: "blog",
        title: params.title,
        description: params.description || "Read our latest posts",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        posts: [
          {
            id: "post-1",
            title: "Getting Started with React",
            slug: "getting-started-react",
            excerpt: "Learn the basics of React development",
            content: "React is a powerful library for building user interfaces...",
            author: {
              name: "Jane Smith",
              bio: "Frontend Developer"
            },
            publishedAt: new Date().toISOString(),
            category: "Development",
            tags: ["react", "javascript", "tutorial"],
            readingTime: 5,
            featured: true
          }
        ],
        layout: "grid",
        categories: [
          { id: "development", name: "Development", slug: "development" },
          { id: "design", name: "Design", slug: "design" }
        ],
        sidebar: { enabled: true }
      };
    }
  },

  portfolio: {
    name: "Portfolio Template",
    description: "Professional portfolios with projects and skills",
    capabilities: ["Project showcases", "Skill displays", "Experience timelines", "Contact forms"],
    useCases: ["Designer portfolios", "Developer showcases", "Artist galleries", "Professional profiles"],
    async generate(params) {
      return {
        templateType: "portfolio",
        title: params.title,
        description: params.description || "Explore my work and experience",
        theme: params.theme || "system",
        primaryColor: params.primaryColor,
        fullScreen: params.fullScreen || false,
        projects: [
          {
            id: "project-1",
            title: "E-commerce Platform",
            description: "Modern e-commerce solution with React and Node.js",
            images: ["/placeholder.jpg?height=300&width=400"],
            category: "Web Development",
            technologies: ["React", "Node.js", "MongoDB"],
            projectUrl: "https://example.com",
            githubUrl: "https://github.com/example",
            year: 2024,
            featured: true
          }
        ],
        about: {
          name: "Alex Developer",
          title: "Full Stack Developer",
          bio: "Passionate developer with 5+ years of experience",
          skills: [
            { name: "React", level: 90, category: "Frontend" },
            { name: "Node.js", level: 85, category: "Backend" }
          ]
        },
        layout: "grid",
        categories: [
          { id: "web", name: "Web Development" },
          { id: "mobile", name: "Mobile Apps" }
        ],
        contact: { enabled: true, form: true }
      };
    }
  }
};

// Utility functions
export function getTemplateSchema(templateType: TemplateType) {
  const schema = templateSchemas[templateType];
  if (!schema) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  return schema.describe(`Schema for ${templateType} template`);
}

export function generateTemplateExample(templateType: TemplateType, useCase?: string) {
  const template = templates[templateType];
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  
  return template.generate({
    title: `Example ${template.name}`,
    description: `This is an example of the ${template.name.toLowerCase()}`,
    useCase,
    theme: "system"
  });
}

export function validateTemplateConfig(templateType: TemplateType, config: any): { success: boolean; errors: string[] } {
  const schema = templateSchemas[templateType];
  if (!schema) {
    return { success: false, errors: [`Unknown template type: ${templateType}`] };
  }

  try {
    schema.parse(config);
    return { success: true, errors: [] };
  } catch (error: any) {
    const errors = error.errors?.map((e: any) => `${e.path.join('.')}: ${e.message}`) || [error.message];
    return { success: false, errors };
  }
}

export { TemplateType, TemplateConfig };
