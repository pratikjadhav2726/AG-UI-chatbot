"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowDownIcon, ArrowUpIcon, BarChart3, LineChart, PieChart, Activity } from "lucide-react"
import { evaluateCondition } from "@/lib/condition-evaluator"

interface DashboardTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function DashboardTemplate({ config, onDataChange }: DashboardTemplateProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    onDataChange({ activeTab: value })
  }

  const renderMetricCard = (metric: any) => {
    let changeIcon = null
    if (metric.change !== undefined) {
      if (metric.changeType === "increase") {
        changeIcon = <ArrowUpIcon className="h-4 w-4 text-green-500" />
      } else if (metric.changeType === "decrease") {
        changeIcon = <ArrowDownIcon className="h-4 w-4 text-red-500" />
      }
    }

    return (
      <Card key={metric.id} className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
          {metric.icon && (
            <div className="h-4 w-4 text-muted-foreground">
              {metric.icon === "activity" && <Activity className="h-4 w-4" />}
              {metric.icon === "barChart" && <BarChart3 className="h-4 w-4" />}
              {metric.icon === "lineChart" && <LineChart className="h-4 w-4" />}
              {metric.icon === "pieChart" && <PieChart className="h-4 w-4" />}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metric.value}</div>
          {metric.change !== undefined && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {changeIcon}
              <span>{Math.abs(metric.change)}% from last period</span>
            </p>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderChartPlaceholder = (chart: any) => (
    <Card key={chart.id} className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{chart.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="flex items-center justify-center bg-muted rounded-md"
          style={{ height: `${chart.height || 200}px` }}
        >
          {chart.type === "bar" && <BarChart3 className="h-8 w-8 text-muted-foreground" />}
          {chart.type === "line" && <LineChart className="h-8 w-8 text-muted-foreground" />}
          {chart.type === "pie" && <PieChart className="h-8 w-8 text-muted-foreground" />}
          {chart.type === "area" && <Activity className="h-8 w-8 text-muted-foreground" />}
          <span className="ml-2 text-sm text-muted-foreground">
            {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart
          </span>
        </div>
      </CardContent>
    </Card>
  )

  const renderActivityItem = (item: any) => (
    <div key={item.id} className="flex items-start space-x-4 py-2">
      <div className="rounded-full bg-primary/10 p-2">
        <Activity className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{item.title}</p>
        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
        <p className="text-xs text-muted-foreground">{item.timestamp}</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {config.charts && config.charts.length > 0 && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          {config.recentActivity && config.recentActivity.length > 0 && (
            <TabsTrigger value="activity">Activity</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div
            className={`grid gap-4 ${
              config.layout === "columns"
                ? "grid-cols-1"
                : config.metrics.length <= 4
                  ? `grid-cols-1 md:grid-cols-${config.metrics.length}`
                  : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {config.metrics && config.metrics.filter((metric: any) => evaluateCondition(metric.renderCondition, config.customData)).map(renderMetricCard)}
          </div>

          {config.charts && config.charts.filter((chart: any) => evaluateCondition(chart.renderCondition, config.customData)).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.charts.filter((chart: any) => evaluateCondition(chart.renderCondition, config.customData)).slice(0, 2).map(renderChartPlaceholder)}
            </div>
          )}

          {config.recentActivity && config.recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">{config.recentActivity.slice(0, 5).map(renderActivityItem)}</div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {config.charts && config.charts.filter((chart: any) => evaluateCondition(chart.renderCondition, config.customData)).length > 0 && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">{config.charts.filter((chart: any) => evaluateCondition(chart.renderCondition, config.customData)).map(renderChartPlaceholder)}</div>
          </TabsContent>
        )}

        {config.recentActivity && config.recentActivity.length > 0 && (
          <TabsContent value="activity">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">{config.recentActivity.map(renderActivityItem)}</div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
