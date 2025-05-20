"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Check, ChevronRight, ChevronLeft } from "lucide-react"

interface WizardTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function WizardTemplate({ config, onDataChange }: WizardTemplateProps) {
  const [currentStep, setCurrentStep] = useState(config.currentStep || 0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle field change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData({
      ...formData,
      [fieldId]: value,
    })

    // Clear error for this field
    if (errors[fieldId]) {
      const newErrors = { ...errors }
      delete newErrors[fieldId]
      setErrors(newErrors)
    }
  }

  // Validate step
  const validateStep = (stepIndex: number) => {
    const step = config.steps[stepIndex]
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (step.fields) {
      step.fields.forEach((field: any) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = `${field.label} is required`
          isValid = false
        }
      })
    }

    setErrors(newErrors)
    return isValid
  }

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      onDataChange({
        currentStep: nextStep,
        formData,
      })
    }
  }

  // Handle previous step
  const handlePrevious = () => {
    const prevStep = currentStep - 1
    setCurrentStep(prevStep)
    onDataChange({
      currentStep: prevStep,
      formData,
    })
  }

  // Handle submit
  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onDataChange({
        completed: true,
        formData,
      })
    }
  }

  // Render field based on type
  const renderField = (field: any) => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              placeholder={field.placeholder}
              value={formData[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={formData[field.id] || ""} onValueChange={(value) => handleFieldChange(field.id, value)}>
              <SelectTrigger id={field.id}>
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      case "checkbox":
        return (
          <div key={field.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field.id}
                checked={formData[field.id] || false}
                onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
              />
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
            </div>
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup value={formData[field.id] || ""} onValueChange={(value) => handleFieldChange(field.id, value)}>
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      case "date":
      case "time":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
            />
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      case "file":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFieldChange(field.id, e.target.files[0].name)
                }
              }}
            />
            {errors[field.id] && <p className="text-sm text-red-500">{errors[field.id]}</p>}
            {field.helpText && <p className="text-sm text-muted-foreground">{field.helpText}</p>}
          </div>
        )

      default:
        return null
    }
  }

  const currentStepData = config.steps[currentStep]
  const isLastStep = currentStep === config.steps.length - 1

  return (
    <Card className="w-full">
      {config.showStepIndicator && (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {config.steps.map((step: any, index: number) => (
              <div key={index} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    index < currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                  }`}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : <span>{index + 1}</span>}
                </div>
                {index < config.steps.length - 1 && (
                  <div className={`h-1 w-10 ${index < currentStep ? "bg-primary" : "bg-muted-foreground/30"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <CardHeader>
        <CardTitle>{currentStepData.title}</CardTitle>
        {currentStepData.description && <CardDescription>{currentStepData.description}</CardDescription>}
      </CardHeader>

      <CardContent>
        {currentStepData.content ? (
          <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
        ) : currentStepData.fields ? (
          <div className="space-y-4">{currentStepData.fields.map(renderField)}</div>
        ) : null}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0 || !config.allowBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {isLastStep ? (
          <Button onClick={handleSubmit}>Complete</Button>
        ) : (
          <Button onClick={handleNext}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
