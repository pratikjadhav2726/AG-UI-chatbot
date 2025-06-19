"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { evaluateCondition } from "@/lib/condition-evaluator"

interface FormTemplateProps {
  config: any
  onDataChange: (data: any) => void
}

export function FormTemplate({ config, onDataChange }: FormTemplateProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (fieldId: string, value: any) => {
    const newData = { ...formData, [fieldId]: value }
    setFormData(newData)
    onDataChange(newData)
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors({ ...errors, [fieldId]: "" })
    }
  }

  const validateField = (field: any) => {
    const value = formData[field.id];
    if (field.required && (value === undefined || value === "" || (Array.isArray(value) && value.length === 0))) {
      return field.validation?.message || `${field.label} is required`;
    }

    if (field.validation && value) { // Only validate if there's a value and validation rules
      if (field.validation.minLength && String(value).length < field.validation.minLength) {
        return field.validation.message || `${field.label} must be at least ${field.validation.minLength} characters`;
      }
      if (field.validation.maxLength && String(value).length > field.validation.maxLength) {
        return field.validation.message || `${field.label} must be no more than ${field.validation.maxLength} characters`;
      }
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(String(value))) {
          return field.validation.message || `${field.label} format is invalid`;
        }
      }
    }
    return "";
  };

  const validateCurrentSection = () => {
    const section = config.sections[currentSection]
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    section.fields.forEach((field: any) => {
      const error = validateField(field)
      if (error) {
        newErrors[field.id] = error
        hasErrors = true
      }
    })

    setErrors(newErrors)
    return !hasErrors
  }

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentSection(Math.min(currentSection + 1, config.sections.length - 1))
    }
  }

  const handlePrev = () => {
    setCurrentSection(Math.max(currentSection - 1, 0))
  }

  const handleSubmit = () => {
    if (validateCurrentSection()) {
      onDataChange({ ...formData, _action: "submit" })
    }
  }

  const renderField = (field: any) => {
    const value = formData[field.id] || ""
    const error = errors[field.id]

    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "phone":
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
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
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
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
              rows={4}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
          </div>
        )

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              <SelectTrigger className={error ? "border-red-500" : ""}>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
          </div>
        )

      case "checkbox":
        if (field.options) {
          // Multiple checkboxes
          return (
            <div key={field.id} className="space-y-2">
              <Label>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="space-y-2">
                {field.options.map((option: any) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${option.value}`}
                      checked={(value || []).includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValues = value || []
                        const newValues = checked
                          ? [...currentValues, option.value]
                          : currentValues.filter((v: string) => v !== option.value)
                        handleInputChange(field.id, newValues)
                      }}
                    />
                    <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
            </div>
          )
        } else {
          // Single checkbox
          return (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.id}
                  checked={!!value}
                  onCheckedChange={(checked) => handleInputChange(field.id, checked)}
                />
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
            </div>
          )
        }

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup value={value} onValueChange={(val) => handleInputChange(field.id, val)}>
              {field.options?.map((option: any) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                  <Label htmlFor={`${field.id}-${option.value}`} className="text-sm">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
          </div>
        )

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="date"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
          </div>
        );

      case "time":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="time"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
          </div>
        );

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
              // For file inputs, value is not controlled directly in the same way
              onChange={(e) => handleInputChange(field.id, e.target.files ? e.target.files[0] : null)}
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {field.helpText && <p className="text-gray-500 text-sm">{field.helpText}</p>}
          </div>
        );

      default:
        return (
          <div key={field.id} className="p-4 border border-dashed border-gray-300 rounded">
            <p className="text-gray-500">Unsupported field type: {field.type}</p>
          </div>
        )
    }
  }

  const visibleSections = config.sections.filter((section: any) =>
    evaluateCondition(section.renderCondition, { ...config.customData, ...formData })
  );

  if (visibleSections.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>No sections are currently visible based on the provided conditions.</p>
        {config.branding?.logoUrl && (
          <div className="flex items-center space-x-2 mt-4 justify-center">
            <img src={config.branding.logoUrl} alt={config.branding.companyName || 'Logo'} className="h-10 w-auto" />
            {config.branding.companyName && <span className="text-lg font-semibold">{config.branding.companyName}</span>}
          </div>
        )}
      </div>
    );
  }

  // Adjust currentSection if it's out of bounds due to filtering
  const adjustedCurrentSection = Math.min(currentSection, visibleSections.length - 1);
  const currentSectionData = visibleSections[adjustedCurrentSection];

  const progress = visibleSections.length > 0 ? ((visibleSections.findIndex(s => s.id === currentSectionData.id) + 1) / visibleSections.length) * 100 : 0;

  // Update handleNext and handlePrev to work with visibleSections
  const handleNext = () => {
    if (validateCurrentSection()) {
      const currentVisibleIndex = visibleSections.findIndex(s => s.id === currentSectionData.id);
      if (currentVisibleIndex < visibleSections.length - 1) {
        setCurrentSection(currentVisibleIndex + 1);
      }
    }
  };

  const handlePrev = () => {
    const currentVisibleIndex = visibleSections.findIndex(s => s.id === currentSectionData.id);
    if (currentVisibleIndex > 0) {
      setCurrentSection(currentVisibleIndex - 1);
    }
  };

  const validateCurrentSection = () => {
    // Important: Ensure validation targets fields within the *currently displayed* section (currentSectionData)
    // and that those fields are also visible based on their own renderConditions.
    const section = currentSectionData; // Already points to the visible section
    if (!section) return true; // Should not happen if visibleSections.length > 0

    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    section.fields.filter((field: any) => evaluateCondition(field.renderCondition, { ...config.customData, ...formData }))
      .forEach((field: any) => {
        const error = validateField(field);
        if (error) {
          newErrors[field.id] = error;
          hasErrors = true;
        }
      });

    setErrors(newErrors);
    return !hasErrors;
  };


  return (
    <div className="space-y-6">
      {config.headerImage && (
        <img src={config.headerImage} alt={config.title || 'Form Header'} className="w-full h-auto max-h-60 object-cover rounded-md" />
      )}
      {config.branding?.logoUrl && (
        <div className="flex items-center space-x-2">
          <img src={config.branding.logoUrl} alt={config.branding.companyName || 'Logo'} className="h-10 w-auto" />
          {config.branding.companyName && <span className="text-lg font-semibold">{config.branding.companyName}</span>}
        </div>
      )}
      {config.showProgress && visibleSections.length > 1 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {visibleSections.findIndex(s => s.id === currentSectionData.id) + 1} of {visibleSections.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{currentSectionData.title}</CardTitle>
          {currentSectionData.description && (
            <CardDescription>{currentSectionData.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className={`grid gap-6 ${currentSectionData.columns > 1 ? `grid-cols-${currentSectionData.columns}` : 'grid-cols-1'}`}>
            {currentSectionData.fields.filter((field: any) => evaluateCondition(field.renderCondition, { ...config.customData, ...formData })).map((field: any) => renderField(field))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <div>
          {visibleSections.findIndex(s => s.id === currentSectionData.id) > 0 && (
            <Button variant="outline" onClick={handlePrev}>
              Previous
            </Button>
          )}
        </div>
        <div className="space-x-2">
          {config.cancelButtonText && (
            <Button variant="outline" onClick={() => onDataChange({ _action: "cancel" })}>
              {config.cancelButtonText}
            </Button>
          )}
          {visibleSections.findIndex(s => s.id === currentSectionData.id) < visibleSections.length - 1 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>
              {config.submitButtonText || "Submit"}
            </Button>
          )}
        </div>
      </div>
      {(config.footer || config.branding?.contactInfo) && (
        <div className="mt-6 pt-4 border-t">
          {config.branding?.contactInfo && (
            <p className="text-sm text-gray-600 mb-2">{config.branding.contactInfo}</p>
          )}
          {config.footer?.text && (
            <p className="text-sm text-gray-600">{config.footer.text}</p>
          )}
          {config.footer?.links && config.footer.links.length > 0 && (
            <div className="mt-2 space-x-4">
              {config.footer.links.map((link: { text: string; url: string }) => (
                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {link.text}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
