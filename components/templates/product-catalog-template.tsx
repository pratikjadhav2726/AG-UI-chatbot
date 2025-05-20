"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Star, Grid, List } from "lucide-react"

interface ProductCatalogTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function ProductCatalogTemplate({ config, onDataChange }: ProductCatalogTemplateProps) {
  const [layout, setLayout] = useState(config.layout || "grid")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortOption, setSortOption] = useState("")

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    onDataChange({ search: e.target.value })
  }

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onDataChange({ category: value })
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOption(value)
    onDataChange({ sort: value })
  }

  // Handle layout change
  const handleLayoutChange = (value: string) => {
    setLayout(value)
    onDataChange({ layout: value })
  }

  // Handle product click
  const handleProductClick = (product: any) => {
    onDataChange({ selectedProduct: product })
  }

  // Filter products by search and category
  let filteredProducts = [...config.products]

  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  if (selectedCategory) {
    filteredProducts = filteredProducts.filter((product) => product.category === selectedCategory)
  }

  // Sort products
  if (sortOption) {
    switch (sortOption) {
      case "price-asc":
        filteredProducts.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filteredProducts.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }
  }

  // Render star rating
  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex flex-wrap gap-2 flex-1">
          {config.categories && (
            <div className="w-full sm:w-auto">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
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
              </div>
            </div>
          )}

          {config.sorting?.enabled !== false && (
            <div className="w-full sm:w-auto">
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="sort" className="text-sm font-medium">
                  Sort By
                </label>
                <Select value={sortOption} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    {config.sorting?.options ? (
                      config.sorting.options.map((option: any) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))
                    ) : (
                      <>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8 w-full"
            />
          </div>

          <div className="flex items-center border rounded-md">
            <Button
              variant={layout === "grid" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleLayoutChange("grid")}
              className="rounded-none rounded-l-md"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === "list" ? "default" : "ghost"}
              size="icon"
              onClick={() => handleLayoutChange("list")}
              className="rounded-none rounded-r-md"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No products found.</p>
        </div>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={product.imageUrl || `/placeholder.svg?height=200&width=200`}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
                {product.badges && product.badges.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.badges.map((badge: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-1">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  {product.rating !== undefined && renderRating(product.rating)}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="font-bold">
                  {product.currency || "$"}
                  {product.price.toFixed(2)}
                </div>
                <Button size="sm" disabled={!product.inStock} onClick={() => handleProductClick(product)}>
                  {product.inStock ? "View Details" : "Sold Out"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-48 h-48">
                  <img
                    src={product.imageUrl || `/placeholder.svg?height=200&width=200`}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex flex-col h-full justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="font-bold">
                          {product.currency || "$"}
                          {product.price.toFixed(2)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      {product.rating !== undefined && renderRating(product.rating)}
                      {product.badges && product.badges.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {product.badges.map((badge: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button size="sm" disabled={!product.inStock} onClick={() => handleProductClick(product)}>
                        {product.inStock ? "View Details" : "Sold Out"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
