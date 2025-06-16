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
    onDataChange({ selectedProduct: product, action: "view_product", productId: product.id, productName: product.name })
  }

  // Handle add to cart
  const handleAddToCart = (product: any) => {
    onDataChange({ action: "add_to_cart", productId: product.id, productName: product.name, price: product.price })
  }

  // Handle wishlist
  const handleWishlist = (product: any) => {
    onDataChange({ action: "add_to_wishlist", productId: product.id, productName: product.name })
  }

  // Filter products by search and category
  let filteredProducts = [...(config.products || [])]

  if (searchTerm) {
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  if (selectedCategory && selectedCategory !== "all") {
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

  // Render product image with fallback
  const renderProductImage = (product: any) => {
    const imageUrl = product.imageUrl || product.images?.[0] || "/placeholder.jpg?height=200&width=200"
    const altText = product.name || "Product image"
    
    return (
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => handleProductClick(product)}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.jpg?height=200&width=200"
        }}
      />
    )
  }

  // Render hero section if available
  const renderHeroSection = () => {
    if (!config.heroSection) return null
    
    return (
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg mb-8"
        style={{ 
          backgroundImage: config.heroSection.backgroundImageUrl ? `url(${config.heroSection.backgroundImageUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">{config.heroSection.title}</h1>
          {config.heroSection.subtitle && (
            <p className="text-xl mb-6 opacity-90">{config.heroSection.subtitle}</p>
          )}
          {config.heroSection.ctaText && (
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => onDataChange({ action: "hero_cta", text: config.heroSection.ctaText })}
            >
              {config.heroSection.ctaText}
            </Button>
          )}
        </div>
        {config.heroSection.backgroundImageUrl && (
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
        )}
      </div>
    )
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
      {/* Hero Section */}
      {renderHeroSection()}
      
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
                        <div className="flex items-center gap-2">
                          {category.imageUrl && (
                            <img src={category.imageUrl} alt={category.name} className="w-4 h-4 rounded" />
                          )}
                          <span>{category.name}</span>
                        </div>
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
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
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
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative">
                {renderProductImage(product)}
                {product.badges && product.badges.length > 0 && (
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.badges.map((badge: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                )}
                {product.discount && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="destructive" className="text-xs">
                      -{product.discount}%
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium truncate flex-1">{product.name}</h3>
                    {product.vendor && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {product.vendor}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  
                  {product.rating !== undefined && (
                    <div className="flex items-center justify-between">
                      {renderRating(product.rating)}
                      {product.reviewCount && (
                        <span className="text-xs text-muted-foreground">
                          ({product.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}
                  
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {product.currency || "$"}{product.price.toFixed(2)}
                    </span>
                    {product.discount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.currency || "$"}{(product.price * (1 + product.discount / 100)).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.shippingInfo && (
                    <span className="text-xs text-muted-foreground">{product.shippingInfo}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleWishlist(product)}>
                    ♡
                  </Button>
                  <Button 
                    size="sm" 
                    disabled={!product.inStock} 
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.inStock ? "Add to Cart" : "Sold Out"}
                  </Button>
                </div>
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
                  {renderProductImage(product)}
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
