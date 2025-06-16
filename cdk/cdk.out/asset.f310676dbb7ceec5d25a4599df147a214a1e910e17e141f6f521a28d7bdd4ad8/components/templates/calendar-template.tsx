"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function CalendarTemplate({ config, onDataChange }: CalendarTemplateProps) {
  // Get current date or use default date from config
  const initialDate = config.defaultDate ? new Date(config.defaultDate) : new Date()
  const [currentDate, setCurrentDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [view, setView] = useState(config.view || "month")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // Get day of week for first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(0, month).toLocaleString("default", { month: "long" })
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    if (!config.events) return []

    const filteredEvents =
      selectedCategory !== "all"
        ? config.events.filter((event: any) => event.category === selectedCategory)
        : config.events

    return filteredEvents.filter((event: any) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (config.selectable) {
      setSelectedDate(date)
      onDataChange({ selectedDate: date.toISOString() })
    }
  }

  // Handle event click
  const handleEventClick = (event: any) => {
    onDataChange({ selectedEvent: event })
  }

  // Handle navigation
  const handlePrevious = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      setCurrentDate(newDate)
    } else if (view === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 1)
      setCurrentDate(newDate)
    }
  }

  const handleNext = () => {
    if (view === "month") {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      setCurrentDate(newDate)
    } else if (view === "day") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 1)
      setCurrentDate(newDate)
    }
  }

  // Handle view change
  const handleViewChange = (newView: string) => {
    setView(newView)
    onDataChange({ view: newView })
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onDataChange({ category: value })
  }

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  // Render month view
  const renderMonthView = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border p-1" />)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const events = getEventsForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={`h-24 border border-border p-1 ${isToday ? "bg-primary/10" : ""} ${
            isSelected ? "ring-2 ring-primary" : ""
          } ${config.selectable ? "cursor-pointer" : ""}`}
          onClick={() => handleDateClick(date)}
        >
          <div className="text-sm font-medium">{day}</div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
            {events.slice(0, 3).map((event: any) => (
              <div
                key={event.id}
                className="text-xs px-1 py-0.5 rounded truncate"
                style={{ backgroundColor: event.color || "hsl(var(--primary))" }}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEventClick(event)
                }}
              >
                {event.title}
              </div>
            ))}
            {events.length > 3 && <div className="text-xs text-muted-foreground">+{events.length - 3} more</div>}
          </div>
        </div>,
      )
    }

    return (
      <div className="grid grid-cols-7 gap-px">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        {days}
      </div>
    )
  }

  // Render week view
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const days = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const events = getEventsForDate(date)
      const isToday = new Date().toDateString() === date.toDateString()
      const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()

      days.push(
        <div key={i} className="flex flex-col">
          <div
            className={`p-2 text-center ${isToday ? "bg-primary/10" : ""} ${isSelected ? "ring-2 ring-primary" : ""}`}
          >
            <div className="text-sm font-medium">{date.toLocaleDateString(undefined, { weekday: "short" })}</div>
            <div className="text-lg">{date.getDate()}</div>
          </div>
          <div className="flex-1 border border-border p-2 space-y-2">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="text-xs p-1 rounded"
                style={{ backgroundColor: event.color || "hsl(var(--primary))" }}
                onClick={() => handleEventClick(event)}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return <div className="grid grid-cols-7 gap-px h-96">{days}</div>
  }

  // Render day view
  const renderDayView = () => {
    const events = getEventsForDate(currentDate)

    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-lg font-medium">{formatDate(currentDate)}</div>
        </div>

        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No events scheduled for this day.</div>
          ) : (
            events.map((event: any) => {
              const startTime = new Date(event.start).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })
              const endTime = event.end
                ? new Date(event.end).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : null

              return (
                <Card key={event.id} className="overflow-hidden" onClick={() => handleEventClick(event)}>
                  <div className="h-2" style={{ backgroundColor: event.color }} />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {event.allDay ? "All day" : endTime ? `${startTime} - ${endTime}` : startTime}
                        </div>
                        {event.location && <div className="text-sm mt-1">{event.location}</div>}
                        {event.description && <div className="text-sm mt-2">{event.description}</div>}
                      </div>
                      {event.category && <Badge style={{ backgroundColor: event.color }}>{event.category}</Badge>}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    )
  }

  // Render agenda view
  const renderAgendaView = () => {
    // Group events by date
    const eventsByDate: Record<string, any[]> = {}

    if (config.events) {
      const filteredEvents =
        selectedCategory !== "all"
          ? config.events.filter((event: any) => event.category === selectedCategory)
          : config.events

      filteredEvents.forEach((event: any) => {
        const date = new Date(event.start).toDateString()
        if (!eventsByDate[date]) {
          eventsByDate[date] = []
        }
        eventsByDate[date].push(event)
      })
    }

    return (
      <div className="space-y-6">
        {Object.keys(eventsByDate).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No events scheduled.</div>
        ) : (
          Object.entries(eventsByDate).map(([date, events]) => (
            <div key={date} className="space-y-2">
              <h3 className="font-medium">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
              <div className="space-y-2">
                {events.map((event: any) => {
                  const startTime = new Date(event.start).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                  const endTime = event.end
                    ? new Date(event.end).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null

                  return (
                    <Card key={event.id} className="overflow-hidden" onClick={() => handleEventClick(event)}>
                      <div className="h-2" style={{ backgroundColor: event.color }} />
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {event.allDay ? "All day" : endTime ? `${startTime} - ${endTime}` : startTime}
                            </div>
                            {event.location && <div className="text-sm mt-1">{event.location}</div>}
                            {event.description && <div className="text-sm mt-2">{event.description}</div>}
                          </div>
                          {event.category && <Badge style={{ backgroundColor: event.color }}>{event.category}</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">
            {view === "month"
              ? `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`
              : view === "week"
                ? `Week of ${formatDate(
                    new Date(
                      currentDate.getFullYear(),
                      currentDate.getMonth(),
                      currentDate.getDate() - currentDate.getDay(),
                    ),
                  )}`
                : formatDate(currentDate)}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {config.categories && config.categories.length > 0 && (
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {config.categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={view} onValueChange={handleViewChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {view === "month" && renderMonthView()}
      {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()}
      {view === "agenda" && renderAgendaView()}
    </div>
  )
}
