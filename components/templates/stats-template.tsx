"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, TrendingUp, Activity } from "lucide-react"

interface StatsTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function StatsTemplate({ config, onDataChange }: StatsTemplateProps) {
  // Handle stat click
  const handleStatClick = (stat: any) => {
    onDataChange({ selectedStat: stat })
  }

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: `repeat(${
          config.layout === "list" ? 1 : Math.min(config.columns || 3, 4)
        }, minmax(0, 1fr))`,
      }}
    >
      {config.stats.map((stat: any) => (
        <Card
          key={stat.id}
          className={`overflow-hidden ${config.layout === "list" ? "flex" : ""}`}
          onClick={() => handleStatClick(stat)}
        >
          <div className={config.layout === "list" ? "flex-1" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              {stat.icon && (
                <div className={`h-4 w-4 ${stat.color ? `text-${stat.color}-500` : "text-muted-foreground"}`}>
                  <Activity className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>

              {stat.description && <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>}

              {stat.change !== undefined && (
                <div
                  className={`flex items-center text-xs ${
                    stat.changeType === "increase"
                      ? "text-green-500"
                      : stat.changeType === "decrease"
                        ? "text-red-500"
                        : "text-muted-foreground"
                  }`}
                >
                  {stat.changeType === "increase" ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                  ) : stat.changeType === "decrease" ? (
                    <ArrowDownIcon className="mr-1 h-3 w-3" />
                  ) : null}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              )}
            </CardContent>
          </div>

          {stat.chart && (
            <div className={`${config.layout === "list" ? "w-32 p-4" : "px-4 pb-4"}`}>
              {stat.chart.type === "sparkline" ? (
                <div className="h-12 w-full">
                  <TrendingUp className="h-full w-full text-muted-foreground/30" />
                </div>
              ) : (
                <div className="h-12 w-12">
                  <div
                    className="h-full w-full rounded-full border-4 border-muted-foreground/30"
                    style={{
                      borderLeftColor: "hsl(var(--primary))",
                      transform: "rotate(45deg)",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
