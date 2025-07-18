/**
 * Sample Data Generator - Generate realistic test data for templates
 */

import { z } from 'zod';

// Data type definitions
const SampleDataSchema = z.object({
  type: z.enum(['users', 'products', 'orders', 'companies', 'events', 'articles', 'comments', 'transactions', 'locations', 'tasks']),
  count: z.number().min(1).max(1000).default(10),
  seed: z.string().optional(),
  options: z.record(z.any()).optional()
});

export class SampleDataGenerator {
  private userNames = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
    'Emily Davis', 'Chris Anderson', 'Lisa Garcia', 'Tom Martinez', 'Amy Taylor',
    'Robert Lee', 'Jennifer White', 'Mark Thompson', 'Michelle Clark', 'Paul Rodriguez'
  ];

  private companies = [
    'TechCorp', 'DataSys Inc', 'CloudWorks', 'InnovateLab', 'DigitalFlow',
    'NextGen Solutions', 'SmartTech', 'FutureSoft', 'CodeCraft', 'ByteBuilders'
  ];

  private productCategories = ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'automotive', 'toys'];
  
  private cities = [
    'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
    'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville'
  ];

  private articleTitles = [
    'The Future of Technology',
    'Best Practices for Development',
    'Understanding User Experience',
    'Market Trends Analysis',
    'Innovation in Business',
    'Sustainable Solutions',
    'Digital Transformation',
    'AI and Machine Learning'
  ];

  async generate(type: string, count: number = 10, seed?: string): Promise<any[]> {
    // Set random seed if provided
    if (seed) {
      this.setSeed(seed);
    }

    switch (type) {
      case 'users':
        return this.generateUsers(count);
      case 'products':
        return this.generateProducts(count);
      case 'orders':
        return this.generateOrders(count);
      case 'companies':
        return this.generateCompanies(count);
      case 'events':
        return this.generateEvents(count);
      case 'articles':
        return this.generateArticles(count);
      case 'comments':
        return this.generateComments(count);
      case 'transactions':
        return this.generateTransactions(count);
      case 'locations':
        return this.generateLocations(count);
      case 'tasks':
        return this.generateTasks(count);
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  }

  private generateUsers(count: number) {
    const users = [];
    const roles = ['admin', 'editor', 'user', 'guest'];
    const statuses = ['active', 'inactive', 'suspended'];

    for (let i = 0; i < count; i++) {
      const name = this.randomChoice(this.userNames);
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
      
      users.push({
        id: `user_${i + 1}`,
        name,
        email,
        avatar: `https://images.unsplash.com/photo-${this.randomInt(1400000000000, 1700000000000)}?w=150&h=150&fit=crop&crop=face`,
        role: this.randomChoice(roles),
        status: this.randomChoice(statuses),
        lastLogin: this.randomPastDate(30),
        createdAt: this.randomPastDate(365),
        phone: this.generatePhoneNumber(),
        location: this.randomChoice(this.cities),
        bio: `${name} is a professional with expertise in their field.`,
        website: `https://${name.toLowerCase().replace(' ', '')}.com`
      });
    }

    return users;
  }

  private generateProducts(count: number) {
    const products = [];
    const statuses = ['active', 'draft', 'out-of-stock'];

    for (let i = 0; i < count; i++) {
      const category = this.randomChoice(this.productCategories);
      const name = this.generateProductName(category);
      
      products.push({
        id: `product_${i + 1}`,
        name,
        sku: `SKU-${this.randomString(6).toUpperCase()}`,
        description: `High-quality ${name.toLowerCase()} with excellent features.`,
        category,
        price: this.randomFloat(9.99, 999.99),
        originalPrice: this.randomFloat(19.99, 1299.99),
        stock: this.randomInt(0, 100),
        rating: this.randomFloat(3.0, 5.0),
        reviews: this.randomInt(0, 500),
        image: `https://images.unsplash.com/photo-${this.randomInt(1400000000000, 1700000000000)}?w=300&h=300&fit=crop`,
        status: this.randomChoice(statuses),
        tags: this.generateTags(category),
        weight: this.randomFloat(0.1, 10.0),
        dimensions: {
          length: this.randomFloat(5, 50),
          width: this.randomFloat(5, 50),
          height: this.randomFloat(1, 20)
        }
      });
    }

    return products;
  }

  private generateOrders(count: number) {
    const orders = [];
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    for (let i = 0; i < count; i++) {
      const orderNumber = `ORD-${String(i + 1).padStart(6, '0')}`;
      const items = this.randomInt(1, 5);
      const subtotal = this.randomFloat(25.00, 500.00);
      const tax = subtotal * 0.08;
      const shipping = items > 2 ? 0 : 9.99;
      const total = subtotal + tax + shipping;

      orders.push({
        id: `order_${i + 1}`,
        orderNumber,
        customer: this.randomChoice(this.userNames),
        email: `customer${i + 1}@example.com`,
        status: this.randomChoice(statuses),
        date: this.randomPastDate(90),
        items,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        shipping: shipping,
        total: Math.round(total * 100) / 100,
        paymentMethod: this.randomChoice(['credit_card', 'paypal', 'bank_transfer']),
        shippingAddress: {
          street: `${this.randomInt(100, 9999)} Main St`,
          city: this.randomChoice(this.cities),
          state: 'CA',
          zip: String(this.randomInt(10000, 99999)),
          country: 'USA'
        },
        trackingNumber: this.randomChoice(statuses) === 'shipped' || this.randomChoice(statuses) === 'delivered' 
          ? `TRK${this.randomString(10).toUpperCase()}` 
          : null
      });
    }

    return orders;
  }

  private generateCompanies(count: number) {
    const companies = [];
    const industries = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing'];
    const sizes = ['Startup', 'Small', 'Medium', 'Large', 'Enterprise'];

    for (let i = 0; i < count; i++) {
      const name = this.randomChoice(this.companies);
      
      companies.push({
        id: `company_${i + 1}`,
        name,
        industry: this.randomChoice(industries),
        size: this.randomChoice(sizes),
        employees: this.randomInt(10, 10000),
        founded: this.randomInt(1990, 2020),
        revenue: this.randomFloat(100000, 100000000),
        website: `https://${name.toLowerCase().replace(/\s+/g, '')}.com`,
        logo: `https://images.unsplash.com/photo-${this.randomInt(1400000000000, 1700000000000)}?w=200&h=200&fit=crop`,
        location: {
          city: this.randomChoice(this.cities),
          state: 'CA',
          country: 'USA'
        },
        description: `${name} is a leading company in the ${this.randomChoice(industries).toLowerCase()} industry.`,
        contacts: {
          phone: this.generatePhoneNumber(),
          email: `info@${name.toLowerCase().replace(/\s+/g, '')}.com`
        }
      });
    }

    return companies;
  }

  private generateEvents(count: number) {
    const events = [];
    const types = ['conference', 'workshop', 'webinar', 'meeting', 'training'];
    const statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];

    for (let i = 0; i < count; i++) {
      const startDate = this.randomFutureDate(180);
      const endDate = new Date(startDate.getTime() + this.randomInt(1, 8) * 60 * 60 * 1000);

      events.push({
        id: `event_${i + 1}`,
        title: `${this.randomChoice(['Tech', 'Business', 'Design', 'Marketing'])} ${this.randomChoice(['Summit', 'Conference', 'Workshop', 'Meetup'])} ${new Date().getFullYear()}`,
        description: 'Join us for an exciting event featuring industry experts and networking opportunities.',
        type: this.randomChoice(types),
        status: this.randomChoice(statuses),
        startDate,
        endDate,
        location: this.randomChoice(this.cities),
        venue: 'Convention Center',
        capacity: this.randomInt(50, 1000),
        attendees: this.randomInt(10, 800),
        price: this.randomFloat(0, 299.99),
        organizer: this.randomChoice(this.userNames),
        tags: this.generateEventTags(),
        image: `https://images.unsplash.com/photo-${this.randomInt(1400000000000, 1700000000000)}?w=400&h=300&fit=crop`
      });
    }

    return events;
  }

  private generateArticles(count: number) {
    const articles = [];
    const categories = ['Technology', 'Business', 'Design', 'Marketing', 'Science'];
    const statuses = ['published', 'draft', 'archived'];

    for (let i = 0; i < count; i++) {
      const title = this.randomChoice(this.articleTitles);
      
      articles.push({
        id: `article_${i + 1}`,
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        excerpt: 'Brief summary of the article content...',
        category: this.randomChoice(categories),
        status: this.randomChoice(statuses),
        author: this.randomChoice(this.userNames),
        publishedAt: this.randomPastDate(365),
        updatedAt: this.randomPastDate(30),
        views: this.randomInt(100, 10000),
        likes: this.randomInt(10, 500),
        comments: this.randomInt(0, 50),
        readTime: this.randomInt(2, 15),
        featuredImage: `https://images.unsplash.com/photo-${this.randomInt(1400000000000, 1700000000000)}?w=600&h=400&fit=crop`,
        tags: this.generateArticleTags(),
        seo: {
          metaTitle: title,
          metaDescription: 'SEO-optimized description for the article.',
          keywords: this.generateArticleTags().join(', ')
        }
      });
    }

    return articles;
  }

  private generateComments(count: number) {
    const comments = [];

    for (let i = 0; i < count; i++) {
      comments.push({
        id: `comment_${i + 1}`,
        content: this.generateCommentContent(),
        author: this.randomChoice(this.userNames),
        email: `commenter${i + 1}@example.com`,
        createdAt: this.randomPastDate(90),
        updatedAt: this.randomPastDate(7),
        likes: this.randomInt(0, 50),
        replies: this.randomInt(0, 10),
        approved: this.randomBoolean(0.9),
        parentId: this.randomBoolean(0.3) ? `comment_${this.randomInt(1, i)}` : null,
        avatar: `https://images.unsplash.com/photo-${this.randomInt(1400000000000, 1700000000000)}?w=80&h=80&fit=crop&crop=face`
      });
    }

    return comments;
  }

  private generateTransactions(count: number) {
    const transactions = [];
    const types = ['income', 'expense'];
    const categories = ['salary', 'freelance', 'investment', 'rent', 'utilities', 'food', 'transport', 'entertainment'];
    const statuses = ['completed', 'pending', 'failed'];

    for (let i = 0; i < count; i++) {
      const type = this.randomChoice(types);
      const amount = type === 'income' ? this.randomFloat(100, 5000) : this.randomFloat(10, 1000);

      transactions.push({
        id: `txn_${i + 1}`,
        type,
        amount: Math.round(amount * 100) / 100,
        currency: 'USD',
        category: this.randomChoice(categories),
        description: `${type === 'income' ? 'Payment received' : 'Payment made'} for ${this.randomChoice(categories)}`,
        status: this.randomChoice(statuses),
        date: this.randomPastDate(365),
        reference: `REF${this.randomString(8).toUpperCase()}`,
        paymentMethod: this.randomChoice(['credit_card', 'bank_transfer', 'cash', 'paypal']),
        merchant: this.randomChoice(this.companies),
        tags: this.generateTransactionTags(type),
        location: this.randomChoice(this.cities)
      });
    }

    return transactions;
  }

  private generateLocations(count: number) {
    const locations = [];
    const types = ['office', 'store', 'warehouse', 'restaurant', 'hotel'];

    for (let i = 0; i < count; i++) {
      locations.push({
        id: `location_${i + 1}`,
        name: `${this.randomChoice(['Central', 'Downtown', 'West', 'East', 'North'])} ${this.randomChoice(types)}`,
        type: this.randomChoice(types),
        address: {
          street: `${this.randomInt(100, 9999)} ${this.randomChoice(['Main', 'Oak', 'Pine', 'First', 'Second'])} St`,
          city: this.randomChoice(this.cities),
          state: 'CA',
          zip: String(this.randomInt(10000, 99999)),
          country: 'USA'
        },
        coordinates: {
          lat: this.randomFloat(32.0, 42.0),
          lng: this.randomFloat(-124.0, -114.0)
        },
        phone: this.generatePhoneNumber(),
        email: `contact@location${i + 1}.com`,
        hours: {
          monday: '9:00 AM - 6:00 PM',
          tuesday: '9:00 AM - 6:00 PM',
          wednesday: '9:00 AM - 6:00 PM',
          thursday: '9:00 AM - 6:00 PM',
          friday: '9:00 AM - 6:00 PM',
          saturday: '10:00 AM - 4:00 PM',
          sunday: 'Closed'
        },
        rating: this.randomFloat(3.0, 5.0),
        reviews: this.randomInt(10, 200)
      });
    }

    return locations;
  }

  private generateTasks(count: number) {
    const tasks = [];
    const statuses = ['todo', 'in-progress', 'review', 'done'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const types = ['bug', 'feature', 'improvement', 'documentation'];

    for (let i = 0; i < count; i++) {
      const createdDate = this.randomPastDate(90);
      const dueDate = this.randomFutureDate(30);

      tasks.push({
        id: `task_${i + 1}`,
        title: `${this.randomChoice(['Fix', 'Implement', 'Update', 'Create', 'Review'])} ${this.randomChoice(['user interface', 'database', 'API', 'documentation', 'tests'])}`,
        description: 'Detailed description of the task requirements and acceptance criteria.',
        status: this.randomChoice(statuses),
        priority: this.randomChoice(priorities),
        type: this.randomChoice(types),
        assignee: this.randomChoice(this.userNames),
        reporter: this.randomChoice(this.userNames),
        createdAt: createdDate,
        updatedAt: this.randomPastDate(7),
        dueDate,
        estimatedHours: this.randomInt(1, 40),
        actualHours: this.randomInt(0, 50),
        tags: this.generateTaskTags(),
        project: `Project ${this.randomChoice(['Alpha', 'Beta', 'Gamma', 'Delta'])}`,
        milestone: `Release ${this.randomFloat(1.0, 3.0).toFixed(1)}`,
        comments: this.randomInt(0, 15),
        attachments: this.randomInt(0, 5)
      });
    }

    return tasks;
  }

  // Helper methods
  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private randomBoolean(probability: number = 0.5): boolean {
    return Math.random() < probability;
  }

  private randomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private randomPastDate(daysAgo: number): Date {
    const now = new Date();
    const past = new Date(now.getTime() - (Math.random() * daysAgo * 24 * 60 * 60 * 1000));
    return past;
  }

  private randomFutureDate(daysFromNow: number): Date {
    const now = new Date();
    const future = new Date(now.getTime() + (Math.random() * daysFromNow * 24 * 60 * 60 * 1000));
    return future;
  }

  private generatePhoneNumber(): string {
    const area = this.randomInt(200, 999);
    const exchange = this.randomInt(200, 999);
    const number = this.randomInt(1000, 9999);
    return `(${area}) ${exchange}-${number}`;
  }

  private generateProductName(category: string): string {
    const adjectives = ['Premium', 'Professional', 'Ultimate', 'Advanced', 'Pro', 'Elite', 'Smart', 'Modern'];
    const electronics = ['Headphones', 'Smartphone', 'Laptop', 'Tablet', 'Speaker', 'Camera', 'Monitor'];
    const clothing = ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers', 'Dress', 'Sweater', 'Coat'];
    const books = ['Guide', 'Manual', 'Handbook', 'Encyclopedia', 'Novel', 'Biography', 'Textbook'];
    const home = ['Chair', 'Table', 'Lamp', 'Rug', 'Mirror', 'Vase', 'Clock'];

    const adj = this.randomChoice(adjectives);
    let noun = '';

    switch (category) {
      case 'electronics':
        noun = this.randomChoice(electronics);
        break;
      case 'clothing':
        noun = this.randomChoice(clothing);
        break;
      case 'books':
        noun = this.randomChoice(books);
        break;
      case 'home':
        noun = this.randomChoice(home);
        break;
      default:
        noun = 'Product';
    }

    return `${adj} ${noun}`;
  }

  private generateTags(category: string): string[] {
    const baseTags = ['featured', 'popular', 'new'];
    const categoryTags: Record<string, string[]> = {
      electronics: ['wireless', 'bluetooth', 'portable', 'gaming'],
      clothing: ['cotton', 'comfortable', 'stylish', 'casual'],
      books: ['bestseller', 'educational', 'fiction', 'non-fiction'],
      home: ['modern', 'decorative', 'functional', 'minimalist']
    };

    const tags = [...baseTags];
    const specific = categoryTags[category] || [];
    tags.push(...this.randomChoice(specific.slice(0, 2)));

    return tags;
  }

  private generateEventTags(): string[] {
    const tags = ['networking', 'learning', 'professional', 'industry', 'innovation'];
    return tags.slice(0, this.randomInt(2, 4));
  }

  private generateArticleTags(): string[] {
    const tags = ['tutorial', 'guide', 'tips', 'best-practices', 'industry-news', 'analysis'];
    return tags.slice(0, this.randomInt(2, 5));
  }

  private generateTransactionTags(type: string): string[] {
    const incomeTags = ['work', 'business', 'investment', 'bonus'];
    const expenseTags = ['essential', 'luxury', 'monthly', 'one-time'];
    
    const baseTags = type === 'income' ? incomeTags : expenseTags;
    return [this.randomChoice(baseTags)];
  }

  private generateTaskTags(): string[] {
    const tags = ['backend', 'frontend', 'urgent', 'enhancement', 'refactor'];
    return tags.slice(0, this.randomInt(1, 3));
  }

  private generateCommentContent(): string {
    const contents = [
      'Great article! Very informative and well-written.',
      'I found this really helpful. Thanks for sharing!',
      'Interesting perspective. I hadn\'t thought about it that way.',
      'Could you provide more details about this topic?',
      'This is exactly what I was looking for. Much appreciated!',
      'I have a different opinion on this matter...',
      'Excellent points! Looking forward to more content like this.',
      'Very well explained. Easy to understand and follow.'
    ];
    return this.randomChoice(contents);
  }

  private setSeed(seed: string): void {
    // Simple seed implementation - in production, use a proper PRNG
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Override Math.random with seeded version
    const originalRandom = Math.random;
    let seedValue = Math.abs(hash);
    
    Math.random = () => {
      seedValue = (seedValue * 9301 + 49297) % 233280;
      return seedValue / 233280;
    };
    
    // Restore original after a short delay (this is a simple implementation)
    setTimeout(() => {
      Math.random = originalRandom;
    }, 100);
  }
}