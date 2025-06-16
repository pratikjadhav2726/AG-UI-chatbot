"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check } from "lucide-react"

interface PricingTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function PricingTemplate({ config, onDataChange }: PricingTemplateProps) {
  const [interval, setInterval] = useState(config.interval || "monthly")

  // Handle interval change
  const handleIntervalChange = () => {
    const newInterval = interval === "monthly" ? "yearly" : "monthly"
    setInterval(newInterval)
    onDataChange({ interval: newInterval })
  }

  // Handle plan selection
  const handlePlanSelect = (plan: any) => {
    onDataChange({ selectedPlan: plan, interval })
  }

  return (
    <div className="space-y-6">
      {/* Interval toggle */}
      {config.showToggle && (
        <div className="flex justify-center items-center gap-2">
          <span className={interval === "monthly" ? "font-medium" : "text-muted-foreground"}>Monthly</span>
          <Switch checked={interval === "yearly"} onCheckedChange={handleIntervalChange} />
          <span className={interval === "yearly" ? "font-medium" : "text-muted-foreground"}>
            Yearly
            <Badge variant="secondary" className="ml-1.5">
              Save 20%
            </Badge>
          </span>
        </div>
      )}

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {config.plans.map((plan: any) => (
          <Card key={plan.id} className={`flex flex-col ${plan.popular ? "border-primary shadow-md relative" : ""}`}>
            {plan.popular && (
              <Badge className="absolute -top-2.5 right-4" variant="default">
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">
                    {config.currency}
                    {plan.discountedPrice || plan.price}
                  </span>
                  {plan.discountedPrice && (
                    <span className="ml-2 text-muted-foreground line-through">
                      {config.currency}
                      {plan.price}
                    </span>
                  )}
                  <span className="ml-1 text-muted-foreground">/{plan.interval || interval}</span>
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature: any, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="mr-2 mt-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className={feature.included ? "" : "text-muted-foreground line-through"}>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handlePlanSelect(plan)}
              >
                {plan.cta.text}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
