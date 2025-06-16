"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, Search } from "lucide-react"

interface DataTableTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function DataTableTemplate({ config, onDataChange }: DataTableTemplateProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(config.pagination?.pageSize || 10)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>({})

  // Handle pagination
  const totalPages = Math.ceil(config.data.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, config.data.length)

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(columnId)
      setSortDirection("asc")
    }

    onDataChange({
      sort: {
        column: columnId,
        direction: sortDirection === "asc" ? "desc" : "asc",
      },
    })
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
    onDataChange({ search: e.target.value })
  }

  // Handle filter change
  const handleFilterChange = (filterId: string, value: string) => {
    setFilters({
      ...filters,
      [filterId]: value,
    })
    setCurrentPage(1)
    onDataChange({ filters: { ...filters, [filterId]: value } })
  }

  // Apply filters and search to data
  let filteredData = [...config.data]

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      filteredData = filteredData.filter((item) => String(item[key]).toLowerCase() === String(value).toLowerCase())
    }
  })

  // Apply search
  if (searchTerm) {
    filteredData = filteredData.filter((item) =>
      Object.values(item).some((val) => val && String(val).toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  // Apply sorting
  if (sortColumn) {
    filteredData.sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  // Get current page data
  const currentData = filteredData.slice(startIndex, endIndex)

  // Render cell content based on cell type
  const renderCell = (row: any, column: any) => {
    const value = row[column.accessorKey]

    if (!column.cell) {
      return value
    }

    switch (column.cell.type) {
      case "badge":
        return (
          <Badge variant={column.cell.options?.variant || "default"} className={column.cell.options?.className}>
            {value}
          </Badge>
        )
      case "image":
        return (
          <img
            src={value || "/placeholder.svg?height=40&width=40"}
            alt={column.cell.options?.alt || "Image"}
            className="h-10 w-10 rounded-md object-cover"
          />
        )
      case "actions":
        return (
          <div className="flex items-center gap-2">
            {column.cell.options?.actions?.map((action: any, i: number) => (
              <Button
                key={i}
                variant={action.variant || "ghost"}
                size="sm"
                onClick={() => onDataChange({ action: action.id, row })}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )
      default:
        return value
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        {config.filters && (
          <div className="flex flex-wrap gap-2 flex-1">
            {config.filters.map((filter: any) => (
              <div key={filter.id} className="w-full sm:w-auto">
                {filter.type === "select" && (
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor={filter.id} className="text-sm font-medium">
                      {filter.label}
                    </label>
                    <Select
                      value={filters[filter.id] || "all"} // Updated default value to "all"
                      onValueChange={(value) => handleFilterChange(filter.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder={`Select ${filter.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem> // Updated value to "all"
                        {filter.options?.map((option: any) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {filter.type === "text" && (
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor={filter.id} className="text-sm font-medium">
                      {filter.label}
                    </label>
                    <Input
                      id={filter.id}
                      value={filters[filter.id] || ""}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      placeholder={`Filter by ${filter.label}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." value={searchTerm} onChange={handleSearch} className="pl-8 w-full" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column: any) => (
                <TableHead key={column.id} className="whitespace-nowrap">
                  {column.enableSorting !== false ? (
                    <Button
                      variant="ghost"
                      onClick={() => handleSort(column.accessorKey)}
                      className="flex items-center gap-1 p-0 font-medium"
                    >
                      {column.header}
                      {sortColumn === column.accessorKey && <ArrowUpDown className="h-4 w-4" />}
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={config.columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row: any, rowIndex: number) => (
                <TableRow key={rowIndex}>
                  {config.columns.map((column: any) => (
                    <TableCell key={column.id}>{renderCell(row, column)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {config.pagination?.enabled !== false && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {endIndex} of {filteredData.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>

            {config.pagination?.pageSizeOptions && (
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent>
                  {config.pagination.pageSizeOptions.map((size: number) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
