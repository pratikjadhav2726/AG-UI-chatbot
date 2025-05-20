"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface GalleryTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function GalleryTemplate({ config, onDataChange }: GalleryTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [lightboxItem, setLightboxItem] = useState<any>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)

  // Filter items by category
  const filteredItems = selectedCategory
    ? config.items.filter((item: any) => item.category === selectedCategory)
    : config.items

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    onDataChange({ category: value })
  }

  // Handle item click
  const handleItemClick = (item: any, index: number) => {
    if (config.lightbox) {
      setLightboxItem(item)
      setLightboxIndex(index)
    }
    onDataChange({ selectedItem: item })
  }

  // Handle lightbox navigation
  const handleLightboxNav = (direction: "prev" | "next") => {
    const items = selectedCategory ? filteredItems : config.items

    let newIndex = lightboxIndex

    if (direction === "prev") {
      newIndex = (newIndex - 1 + items.length) % items.length
    } else {
      newIndex = (newIndex + 1) % items.length
    }

    setLightboxItem(items[newIndex])
    setLightboxIndex(newIndex)
    onDataChange({ selectedItem: items[newIndex] })
  }

  return (
    <div className="space-y-4">
      {/* Categories */}
      {config.categories && config.categories.length > 0 && (
        <Tabs defaultValue="" value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="">All</TabsTrigger>
            {config.categories.map((category: any) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Gallery */}
      {config.layout === "grid" && (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${config.columns || 3}, minmax(0, 1fr))`,
          }}
        >
          {filteredItems.map((item: any, index: number) => (
            <div
              key={item.id}
              className="group relative cursor-pointer overflow-hidden rounded-md"
              onClick={() => handleItemClick(item, index)}
            >
              <img
                src={item.imageUrl || "/placeholder.svg?height=200&width=200"}
                alt={item.title || "Gallery image"}
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {(item.title || item.description) && (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  {item.title && <h3 className="font-medium text-white">{item.title}</h3>}
                  {item.description && <p className="text-sm text-white/80">{item.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {config.layout === "masonry" && (
        <div
          className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4"
          style={{ columnCount: config.columns || 3 }}
        >
          {filteredItems.map((item: any, index: number) => (
            <div
              key={item.id}
              className="break-inside-avoid group relative cursor-pointer overflow-hidden rounded-md"
              onClick={() => handleItemClick(item, index)}
            >
              <img
                src={item.imageUrl || "/placeholder.svg?height=200&width=200"}
                alt={item.title || "Gallery image"}
                className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {(item.title || item.description) && (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  {item.title && <h3 className="font-medium text-white">{item.title}</h3>}
                  {item.description && <p className="text-sm text-white/80">{item.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {config.layout === "carousel" && (
        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4">
              {filteredItems.map((item: any, index: number) => (
                <div
                  key={item.id}
                  className="group relative cursor-pointer overflow-hidden rounded-md flex-shrink-0"
                  style={{ width: `${100 / Math.min(config.columns || 3, 3)}%` }}
                  onClick={() => handleItemClick(item, index)}
                >
                  <img
                    src={item.imageUrl || "/placeholder.svg?height=200&width=200"}
                    alt={item.title || "Gallery image"}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {(item.title || item.description) && (
                    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
                      {item.title && <h3 className="font-medium text-white">{item.title}</h3>}
                      {item.description && <p className="text-sm text-white/80">{item.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxItem && config.lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-white"
            onClick={() => setLightboxItem(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white"
            onClick={() => handleLightboxNav("prev")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="max-h-[80vh] max-w-[80vw]">
            <img
              src={lightboxItem.imageUrl || "/placeholder.svg?height=600&width=800"}
              alt={lightboxItem.title || "Gallery image"}
              className="max-h-[80vh] max-w-[80vw] object-contain"
            />

            {(lightboxItem.title || lightboxItem.description) && (
              <div className="mt-4 text-center text-white">
                {lightboxItem.title && <h3 className="text-xl font-medium">{lightboxItem.title}</h3>}
                {lightboxItem.description && <p className="mt-1 text-white/80">{lightboxItem.description}</p>}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white"
            onClick={() => handleLightboxNav("next")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  )
}
