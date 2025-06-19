"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DashboardTemplate } from "@/components/templates/dashboard-template"
import { DataTableTemplate } from "@/components/templates/data-table-template"
import { ProductCatalogTemplate } from "@/components/templates/product-catalog-template"
import { ProfileCardTemplate } from "@/components/templates/profile-card-template"
import { TimelineTemplate } from "@/components/templates/timeline-template"
import { GalleryTemplate } from "@/components/templates/gallery-template"
import { PricingTemplate } from "@/components/templates/pricing-template"
import { StatsTemplate } from "@/components/templates/stats-template"
import { CalendarTemplate } from "@/components/templates/calendar-template"
import { WizardTemplate } from "@/components/templates/wizard-template"
import { ChartTemplate } from "@/components/templates/chart-template"
import { MapTemplate } from "@/components/templates/map-template"
import { KanbanTemplate } from "@/components/templates/kanban-template"
import { FeedTemplate } from "@/components/templates/feed-template"
import { FormTemplate } from "@/components/templates/form-template"
import { AnalyticsTemplate } from "@/components/templates/analytics-template";
import { MarketplaceTemplate } from "@/components/templates/marketplace-template";
import { EcommerceTemplate } from "@/components/templates/ecommerce-template";
import { BlogTemplate } from "@/components/templates/blog-template";
import { PortfolioTemplate } from "@/components/templates/portfolio-template";
import { resolvePayload } from '@/lib/payload-resolver';
import type { ActionSchema } from '@/lib/template-schemas';

interface DynamicTemplateProps {
  config: any
  onInteraction: (data: any) => void
  onClose: () => void
}

export function DynamicTemplate({ config, onInteraction, onClose }: DynamicTemplateProps) {
  const [data, setData] = useState<any>({})

  const handleDataChange = (newData: any) => {
    setData({ ...data, ...newData })
  }

  const handleSubmit = () => {
    const submitAction = config.actions?.find((a: ActionSchema) => a.trigger === "onSubmit");
    if (submitAction) {
      if (submitAction.confirmationMessage) {
        if (!window.confirm(submitAction.confirmationMessage)) return;
      }

      const resolvedPayload = resolvePayload(submitAction.payload || submitAction.arguments, { form: data, customData: config.customData });

      onInteraction({
        type: submitAction.type, // MCP_TOOL_CALL, CUSTOM_EVENT, NAVIGATE, API_CALL
        actionId: submitAction.id,
        // Pass specific fields based on type
        ...(submitAction.type === 'MCP_TOOL_CALL' && { toolName: submitAction.toolName, arguments: resolvedPayload }),
        ...(submitAction.type === 'CUSTOM_EVENT' && { eventName: submitAction.eventName, payload: resolvedPayload }),
        ...(submitAction.type === 'NAVIGATE' && { navigateTo: submitAction.navigateTo }),
        ...(submitAction.type === 'API_CALL' && { apiUrl: submitAction.apiUrl, apiMethod: submitAction.apiMethod, payload: resolvedPayload }),
      });
    } else {
      // Fallback or default behavior if no specific onSubmit action is defined
      onInteraction({ templateType: config.templateType, data });
    }
  };

  // Render the appropriate template based on the template type
  const renderTemplate = () => {
    switch (config.templateType) {
      case "dashboard":
        return <DashboardTemplate config={config} onDataChange={handleDataChange} />
      case "dataTable":
        return <DataTableTemplate config={config} onDataChange={handleDataChange} />
      case "productCatalog":
        return <ProductCatalogTemplate config={config} onDataChange={handleDataChange} />
      case "profileCard":
        return <ProfileCardTemplate config={config} onDataChange={handleDataChange} />
      case "timeline":
        return <TimelineTemplate config={config} onDataChange={handleDataChange} />
      case "gallery":
        return <GalleryTemplate config={config} onDataChange={handleDataChange} />
      case "pricing":
        return <PricingTemplate config={config} onDataChange={handleDataChange} />
      case "stats":
        return <StatsTemplate config={config} onDataChange={handleDataChange} />
      case "calendar":
        return <CalendarTemplate config={config} onDataChange={handleDataChange} />
      case "wizard":
        return <WizardTemplate config={config} onDataChange={handleDataChange} />
      case "chart":
        return <ChartTemplate config={config} onDataChange={handleDataChange} />
      case "map":
        return <MapTemplate config={config} onDataChange={handleDataChange} />
      case "kanban":
        return <KanbanTemplate config={config} onDataChange={handleDataChange} />
      case "feed":
        return <FeedTemplate config={config} onDataChange={handleDataChange} />
      case "form":
        return <FormTemplate config={config} onDataChange={handleDataChange} />
      case "marketplace":
        return <MarketplaceTemplate config={config} onDataChange={handleDataChange} />;
      case "analytics":
        return <AnalyticsTemplate config={config} onDataChange={handleDataChange} />;
      case "ecommerce":
        return <EcommerceTemplate config={config} onDataChange={handleDataChange} />;
      case "blog":
        return <BlogTemplate config={config} onDataChange={handleDataChange} />;
      case "portfolio":
        return <PortfolioTemplate config={config} onDataChange={handleDataChange} />;
      default:
        return <div>Unknown template type: {config.templateType}</div>
    }
  }

  return (
    <Card
      className={`${
        config.fullScreen ? "w-[95vw] h-[90vh]" : "w-full max-w-4xl max-h-[90vh]"
      } overflow-hidden flex flex-col`}
      style={
        {
          "--primary-color": config.primaryColor || "hsl(var(--primary))",
        } as React.CSSProperties
      }
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{config.title}</CardTitle>
          {config.description && <CardDescription>{config.description}</CardDescription>}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">{renderTemplate()}</ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2 border-t p-4">
        <Button variant="outline" onClick={onClose}>
          {config.closeButtonText || "Close"}
        </Button>
        {config.actionButtonText && <Button onClick={handleSubmit}>{config.actionButtonText}</Button>}
      </CardFooter>
    </Card>
  )
}
