"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, ChevronDown, ChevronUp, Clock, Paperclip, MessageSquare } from "lucide-react"

interface KanbanTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function KanbanTemplate({ config, onDataChange }: KanbanTemplateProps) {
  const [filter, setFilter] = useState<string>("all")
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({})

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilter(value)
    onDataChange({ filter: value })
  }

  // Handle card click
  const handleCardClick = (card: any, columnId: string) => {
    onDataChange({ selectedCard: card, columnId })
  }

  // Handle column collapse toggle
  const handleColumnToggle = (columnId: string) => {
    setCollapsedColumns({
      ...collapsedColumns,
      [columnId]: !collapsedColumns[columnId],
    })
  }

  // Get priority badge variant
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline">Low</Badge>
      case "medium":
        return <Badge variant="secondary">Medium</Badge>
      case "high":
        return <Badge variant="default">High</Badge>
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      {config.filters && config.filters.length > 0 && (
        <div className="flex justify-end">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Items" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              {config.filters.map((filter: any) => (
                <SelectItem key={filter.id} value={filter.id}>
                  {filter.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {config.columns.map((column: any) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <Card>
              <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium flex items-center">
                  {column.title}
                  {column.limit && (
                    <Badge variant="outline" className="ml-2">
                      {column.cards.length}/{column.limit}
                    </Badge>
                  )}
                </CardTitle>
                {config.collapsibleColumns && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleColumnToggle(column.id)}
                  >
                    {collapsedColumns[column.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-3">
                {!collapsedColumns[column.id] && (
                  <div className="space-y-2">
                    {column.cards.map((card: any) => (
                      <Card
                        key={card.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleCardClick(card, column.id)}
                      >
                        <CardContent className="p-3 space-y-2">
                          {card.labels && card.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {card.labels.map((label: any, index: number) => (
                                <div
                                  key={index}
                                  className="h-2 w-12 rounded-full"
                                  style={{ backgroundColor: label.color }}
                                />
                              ))}
                            </div>
                          )}
                          <h3 className="font-medium text-sm">{card.title}</h3>
                          {card.description && <p className="text-xs text-muted-foreground">{card.description}</p>}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              {card.priority && getPriorityBadge(card.priority)}
                              {card.dueDate && (
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center space-x-2">
                              {card.attachments && (
                                <div className="flex items-center">
                                  <Paperclip className="h-3 w-3 mr-1" />
                                  <span>{card.attachments}</span>
                                </div>
                              )}
                              {card.comments && (
                                <div className="flex items-center">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  <span>{card.comments}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {card.assignees && card.assignees.length > 0 && (
                            <div className="flex -space-x-2">
                              {card.assignees.map((assignee: any, index: number) => (
                                <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                  {assignee.avatarUrl ? (
                                    <AvatarImage src={assignee.avatarUrl || "/placeholder.svg"} alt={assignee.name} />
                                  ) : (
                                    <AvatarFallback>
                                      {assignee.name
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {config.allowDragDrop && (
                      <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add a card
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
