"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, ScatterChart, Activity } from "lucide-react"

interface ChartTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function ChartTemplate({ config, onDataChange }: ChartTemplateProps) {
  const [filter, setFilter] = useState<string>("")
  const [timeRange, setTimeRange] = useState<string>("all")

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value)
    onDataChange({ filter: value })
  }

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    onDataChange({ timeRange: value })
  }

  // Render chart placeholder based on type
  const renderChartPlaceholder = () => {
    const height = config.options?.aspectRatio
      ? `${config.height / config.options.aspectRatio}px`
      : `${config.height || 400}px`

    switch (config.chartType) {
      case "bar":
        return (
          <div className="flex items-center justify-center h-full">
            <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )
      case "line":
      case "area":
        return (
          <div className="flex items-center justify-center h-full">
            <Activity className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )
      case "pie":
        return (
          <div className="flex items-center justify-center h-full">
            <PieChart className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )
      case "scatter":
        return (
          <div className="flex items-center justify-center h-full">
            <ScatterChart className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )
      case "radar":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 border-2 border-muted-foreground/50 rounded-full" />
              <div className="absolute inset-2 border-2 border-muted-foreground/30 rounded-full" />
              <div className="absolute inset-4 border-2 border-muted-foreground/20 rounded-full" />
              <div className="absolute inset-6 border-2 border-muted-foreground/10 rounded-full" />
            </div>
          </div>
        )
      case "mixed":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
              <LineChart className="h-12 w-12 text-muted-foreground/50" />
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <Activity className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )
    }
  }

  // Render legend
  const renderLegend = () => {
    if (!config.data?.datasets || !config.options?.showLegend) return null

    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {config.data.datasets.map((dataset: any, index: number) => (
          <div key={index} className="flex items-center">
            <div
              className="h-3 w-3 mr-2 rounded-sm"
              style={{
                backgroundColor: Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[0]
                  : dataset.backgroundColor || `hsl(${index * 40}, 70%, 50%)`,
              }}
            />
            <span className="text-sm">{dataset.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-between">
        {config.filters && config.filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.filters.map((filter: any) => {
              if (filter.type === "select") {
                return (
                  <Select
                    key={filter.id}
                    value={filter.id === "timeRange" ? timeRange : filter}
                    onValueChange={filter.id === "timeRange" ? handleTimeRangeChange : handleFilterChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {filter.options?.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              } else if (filter.type === "tabs") {
                return (
                  <Tabs
                    key={filter.id}
                    value={filter.id === "timeRange" ? timeRange : filter}
                    onValueChange={filter.id === "timeRange" ? handleTimeRangeChange : handleFilterChange}
                  >
                    <TabsList>
                      {filter.options?.map((option: any) => (
                        <TabsTrigger key={option.value} value={option.value}>
                          {option.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )
              }
              return null
            })}
          </div>
        )}

        {/* Chart type selector */}
        {config.chartType === "mixed" && (
          <Select defaultValue="combined" onValueChange={(value) => onDataChange({ viewType: value })}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Chart Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="combined">Combined</SelectItem>
              <SelectItem value="separate">Separate</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>{config.title || "Chart"}</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div
            className="w-full bg-muted/30 rounded-md overflow-hidden"
            style={{ height: `${config.height || 400}px` }}
          >
            {renderChartPlaceholder()}
          </div>

          {renderLegend()}
        </CardContent>
      </Card>

      {/* Data summary */}
      {config.data?.labels && (
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle className="text-sm">Data Summary</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="text-sm">
              <p>
                <span className="font-medium">Data points:</span> {config.data.labels.length}
              </p>
              <p>
                <span className="font-medium">Series:</span> {config.data.datasets.length}
              </p>
              {config.data.datasets.map((dataset: any, index: number) => (
                <p key={index}>
                  <span className="font-medium">{dataset.label}:</span> Min:{" "}
                  {Math.min(...dataset.data).toLocaleString()}, Max: {Math.max(...dataset.data).toLocaleString()}, Avg:{" "}
                  {(dataset.data.reduce((a: number, b: number) => a + b, 0) / dataset.data.length).toLocaleString(
                    undefined,
                    { maximumFractionDigits: 2 },
                  )}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
