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
    onInteraction({
      templateType: config.templateType,
      data,
    })
  }

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
        return <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Marketplace Template</h3>
          <p className="text-gray-600">Multi-vendor marketplace with advanced filtering</p>
          <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      case "analytics":
        return <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Analytics Template</h3>
          <p className="text-gray-600">Comprehensive analytics dashboards with KPIs</p>
          <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      case "ecommerce":
        return <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">E-commerce Template</h3>
          <p className="text-gray-600">Full-featured e-commerce product displays</p>
          <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      case "blog":
        return <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Blog Template</h3>
          <p className="text-gray-600">Blog layouts with posts, categories, and authors</p>
          <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      case "portfolio":
        return <div className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Portfolio Template</h3>
          <p className="text-gray-600">Professional portfolios with projects and skills</p>
          <pre className="mt-4 text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
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
