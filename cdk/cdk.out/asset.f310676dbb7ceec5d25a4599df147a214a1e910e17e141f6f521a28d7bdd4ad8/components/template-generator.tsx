'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Trash2, Eye, Code } from 'lucide-react';
import { useTemplates } from '@/hooks/use-templates';
import { DynamicTemplate } from '@/components/dynamic-template';

const templateTypes = [
  { value: 'dashboard', label: 'Dashboard', description: 'Interactive dashboards with metrics and charts' },
  { value: 'dataTable', label: 'Data Table', description: 'Sortable, filterable data tables' },
  { value: 'form', label: 'Form', description: 'Dynamic forms with validation' },
  { value: 'productCatalog', label: 'Product Catalog', description: 'E-commerce product listings' },
  { value: 'analytics', label: 'Analytics', description: 'Analytics dashboards with KPIs' },
  { value: 'marketplace', label: 'Marketplace', description: 'Marketplace item listings' },
  { value: 'blog', label: 'Blog', description: 'Blog post layouts' },
  { value: 'portfolio', label: 'Portfolio', description: 'Portfolio project showcases' },
  { value: 'ecommerce', label: 'E-commerce', description: 'Shopping interfaces' },
  { value: 'pricing', label: 'Pricing', description: 'Pricing plans and comparisons' },
  { value: 'stats', label: 'Statistics', description: 'Statistics and KPI displays' },
  { value: 'calendar', label: 'Calendar', description: 'Event calendars' },
  { value: 'timeline', label: 'Timeline', description: 'Event timelines' },
  { value: 'gallery', label: 'Gallery', description: 'Image and media galleries' },
  { value: 'chart', label: 'Chart', description: 'Data visualization charts' },
  { value: 'kanban', label: 'Kanban', description: 'Task boards' },
  { value: 'feed', label: 'Feed', description: 'Social media style feeds' },
  { value: 'wizard', label: 'Wizard', description: 'Multi-step forms' },
  { value: 'map', label: 'Map', description: 'Interactive maps' },
  { value: 'profileCard', label: 'Profile Card', description: 'User profile displays' }
];

const useCaseExamples = {
  dashboard: ['Business Analytics', 'Sales Monitoring', 'System Monitoring', 'Marketing Campaign'],
  dataTable: ['User Management', 'Order History', 'Product Inventory', 'Transaction Records'],
  form: ['Contact Form', 'User Registration', 'Survey', 'Job Application', 'Feedback Form'],
  productCatalog: ['E-commerce Store', 'Digital Products', 'Service Catalog', 'Course Catalog'],
  analytics: ['Website Analytics', 'Sales Analytics', 'User Behavior', 'Performance Metrics'],
  marketplace: ['Online Marketplace', 'Service Marketplace', 'Digital Assets', 'Rental Platform'],
  blog: ['Company Blog', 'Personal Blog', 'News Site', 'Documentation'],
  portfolio: ['Design Portfolio', 'Developer Portfolio', 'Photography', 'Creative Work'],
  ecommerce: ['Online Store', 'Digital Products', 'Subscription Service', 'Marketplace'],
  pricing: ['SaaS Pricing', 'Service Pricing', 'Product Plans', 'Subscription Tiers']
};

export function TemplateGenerator() {
  const { templates, isLoading, error, generateTemplate, clearTemplates, removeTemplate } = useTemplates();
  const [formData, setFormData] = useState({
    templateType: '',
    title: '',
    description: '',
    useCase: '',
    theme: 'system' as 'light' | 'dark' | 'system',
    primaryColor: '#3b82f6',
    fullScreen: false
  });
  const [activeTab, setActiveTab] = useState('generator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.templateType || !formData.title) return;

    await generateTemplate(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedTemplateType = templateTypes.find(t => t.value === formData.templateType);
  const availableUseCases = formData.templateType ? useCaseExamples[formData.templateType as keyof typeof useCaseExamples] || [] : [];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Template Generator</h1>
        <p className="text-muted-foreground">
          Generate dynamic UI templates using shadcn/ui components with AI assistance
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="preview">Preview ({templates.length})</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Template Configuration
              </CardTitle>
              <CardDescription>
                Configure your template parameters and let AI generate a customized UI component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="templateType">Template Type</Label>
                      <Select value={formData.templateType} onValueChange={(value) => handleInputChange('templateType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a template type" />
                        </SelectTrigger>
                        <SelectContent>
                          {templateTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-muted-foreground">{type.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedTemplateType && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedTemplateType.description}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter template title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Optional description"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="useCase">Use Case</Label>
                      <Select value={formData.useCase} onValueChange={(value) => handleInputChange('useCase', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a use case (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUseCases.map((useCase) => (
                            <SelectItem key={useCase} value={useCase.toLowerCase().replace(/\s+/g, '-')}>
                              {useCase}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableUseCases.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {availableUseCases.slice(0, 3).map((useCase) => (
                            <Badge
                              key={useCase}
                              variant="secondary"
                              className="text-xs cursor-pointer"
                              onClick={() => handleInputChange('useCase', useCase.toLowerCase().replace(/\s+/g, '-'))}
                            >
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="fullScreen"
                        checked={formData.fullScreen}
                        onCheckedChange={(checked) => handleInputChange('fullScreen', checked)}
                      />
                      <Label htmlFor="fullScreen">Full Screen Mode</Label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isLoading || !formData.templateType || !formData.title}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Template
                      </>
                    )}
                  </Button>
                  {templates.length > 0 && (
                    <Button type="button" variant="outline" onClick={clearTemplates}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </form>

              {error && (
                <Alert className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Templates Generated</h3>
                  <p className="text-muted-foreground">
                    Generate your first template to see the preview here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {templates.map((template, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>
                        {template.templateType} • {template.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeTemplate(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <DynamicTemplate config={template} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="code" className="space-y-6">
          {templates.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Code to Display</h3>
                  <p className="text-muted-foreground">
                    Generate templates to see their configuration code
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {templates.map((template, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{template.title} Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{JSON.stringify(template, null, 2)}</code>
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
