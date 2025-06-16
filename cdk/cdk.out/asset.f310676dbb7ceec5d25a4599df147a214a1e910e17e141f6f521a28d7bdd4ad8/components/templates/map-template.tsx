"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Layers } from "lucide-react"

interface MapTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function MapTemplate({ config, onDataChange }: MapTemplateProps) {
  const [mapType, setMapType] = useState(config.mapType || "roadmap")
  const [selectedMarker, setSelectedMarker] = useState<any>(null)

  // Handle map type change
  const handleMapTypeChange = (value: string) => {
    setMapType(value)
    onDataChange({ mapType: value })
  }

  // Handle marker click
  const handleMarkerClick = (marker: any) => {
    setSelectedMarker(marker)
    onDataChange({ selectedMarker: marker })
  }

  // Handle polygon click
  const handlePolygonClick = (polygon: any) => {
    onDataChange({ selectedPolygon: polygon })
  }

  return (
    <div className="space-y-4">
      {/* Map controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => onDataChange({ action: "zoomIn" })}>
            <span className="mr-1">+</span> Zoom In
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDataChange({ action: "zoomOut" })}>
            <span className="mr-1">-</span> Zoom Out
          </Button>
        </div>

        <Select value={mapType} onValueChange={handleMapTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Map Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="roadmap">Road Map</SelectItem>
            <SelectItem value="satellite">Satellite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
            <SelectItem value="terrain">Terrain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Map placeholder */}
      <div
        className="relative rounded-md border bg-muted"
        style={{ height: `${config.height || 400}px`, width: "100%" }}
      >
        {/* Map center indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Navigation className="h-8 w-8 text-primary" />
          <div className="text-xs text-center mt-1 font-medium">
            {config.center.lat.toFixed(4)}, {config.center.lng.toFixed(4)}
          </div>
        </div>

        {/* Render markers */}
        {config.markers &&
          config.markers.map((marker: any) => {
            // Calculate position relative to center
            const offsetX = (marker.position.lng - config.center.lng) * 20
            const offsetY = (config.center.lat - marker.position.lat) * 20

            return (
              <div
                key={marker.id}
                className="absolute cursor-pointer"
                style={{
                  top: `calc(50% + ${offsetY}%)`,
                  left: `calc(50% + ${offsetX}%)`,
                }}
                onClick={() => handleMarkerClick(marker)}
              >
                <MapPin
                  className={`h-6 w-6 ${
                    selectedMarker?.id === marker.id ? "text-primary" : marker.color || "text-red-500"
                  }`}
                />
                {selectedMarker?.id === marker.id && (
                  <Card className="absolute bottom-full mb-2 w-48 z-10">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm">{marker.title || "Location"}</CardTitle>
                    </CardHeader>
                    {marker.description && (
                      <CardContent className="p-3 pt-0">
                        <p className="text-xs">{marker.description}</p>
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            )
          })}

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 bg-background/80 text-xs p-1 rounded">
          <div className="flex items-center">
            <Layers className="h-3 w-3 mr-1" />
            <span>Map Data</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      {(config.markers?.length > 0 || config.polygons?.length > 0) && (
        <div className="text-sm border rounded-md p-3">
          <h4 className="font-medium mb-2">Legend</h4>
          <div className="space-y-1">
            {config.markers?.map((marker: any) => (
              <div key={marker.id} className="flex items-center">
                <MapPin className={`h-4 w-4 mr-2 ${marker.color || "text-red-500"}`} />
                <span>{marker.title || `Marker ${marker.id}`}</span>
              </div>
            ))}
            {config.polygons?.map((polygon: any) => (
              <div key={polygon.id} className="flex items-center">
                <div
                  className="h-3 w-3 mr-2 rounded-sm"
                  style={{ backgroundColor: polygon.fillColor || "rgba(0, 0, 255, 0.2)" }}
                />
                <span>{polygon.title || `Area ${polygon.id}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
