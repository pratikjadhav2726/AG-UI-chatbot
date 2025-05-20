"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock } from "lucide-react"

interface TimelineTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function TimelineTemplate({ config, onDataChange }: TimelineTemplateProps) {
  const [filter, setFilter] = useState<string>("all")

  // Group events by date if needed
  const groupedEvents = config.groupByDate
    ? config.events.reduce((groups: any, event: any) => {
        const date = new Date(event.date).toLocaleDateString()
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(event)
        return groups
      }, {})
    : null

  // Filter events
  const filteredEvents =
    filter !== "all" ? config.events.filter((event: any) => event.category === filter) : config.events

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value)
    onDataChange({ filter: value })
  }

  // Handle event click
  const handleEventClick = (event: any) => {
    onDataChange({ selectedEvent: event })
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {config.filters && config.filters.length > 0 && (
        <div className="flex justify-end">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {config.filters
                .filter((f: any) => f.type === "category")
                .flatMap((f: any) => f.options || [])
                .map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Timeline */}
      {config.layout === "horizontal" ? (
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border" />
          <div className="relative flex justify-between gap-4 py-10 overflow-x-auto">
            {filteredEvents.map((event: any, index: number) => (
              <div
                key={event.id}
                className="flex flex-col items-center min-w-[150px] max-w-[200px]"
                onClick={() => handleEventClick(event)}
              >
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs text-muted-foreground">{formatDate(event.date)}</div>
                  <h3 className="font-medium">{event.title}</h3>
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                  )}
                  {event.category && (
                    <Badge variant="secondary" className="mt-1" style={{ backgroundColor: event.color }}>
                      {event.category}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : config.groupByDate ? (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([date, events]: [string, any]) => (
            <div key={date} className="space-y-2">
              <h3 className="font-medium text-lg sticky top-0 bg-background py-2">{date}</h3>
              <div className="space-y-4 border-l-2 border-border pl-6">
                {events.map((event: any) => (
                  <div key={event.id} className="relative" onClick={() => handleEventClick(event)}>
                    <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-primary" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(event.date)}</span>
                    </div>
                    <h4 className="font-medium">{event.title}</h4>
                    {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
                    {event.category && (
                      <Badge variant="secondary" className="mt-1" style={{ backgroundColor: event.color }}>
                        {event.category}
                      </Badge>
                    )}
                    {event.media && (
                      <div className="mt-2 rounded-md overflow-hidden">
                        {event.media.type === "image" ? (
                          <img
                            src={event.media.url || "/placeholder.svg?height=100&width=200"}
                            alt={event.title}
                            className="max-h-32 object-cover"
                          />
                        ) : (
                          <video src={event.media.url} controls className="max-h-32" />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 border-l-2 border-border pl-6">
          {filteredEvents.map((event: any) => (
            <div key={event.id} className="relative" onClick={() => handleEventClick(event)}>
              <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-primary" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(event.date)}</span>
                <Clock className="h-3 w-3 ml-2" />
                <span>{formatTime(event.date)}</span>
              </div>
              <h4 className="font-medium">{event.title}</h4>
              {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
              {event.category && (
                <Badge variant="secondary" className="mt-1" style={{ backgroundColor: event.color }}>
                  {event.category}
                </Badge>
              )}
              {event.media && (
                <div className="mt-2 rounded-md overflow-hidden">
                  {event.media.type === "image" ? (
                    <img
                      src={event.media.url || "/placeholder.svg?height=100&width=200"}
                      alt={event.title}
                      className="max-h-32 object-cover"
                    />
                  ) : (
                    <video src={event.media.url} controls className="max-h-32" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
