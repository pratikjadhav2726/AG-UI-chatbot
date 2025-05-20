"use client"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface DynamicFormProps {
  schema: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function DynamicForm({ schema, onSubmit, onCancel }: DynamicFormProps) {
  // Create a dynamic Zod schema based on the provided schema
  const createZodSchema = (formSchema: any) => {
    const schemaFields: Record<string, any> = {}

    formSchema.sections.forEach((section: any) => {
      section.fields.forEach((field: any) => {
        let fieldSchema: any

        switch (field.type) {
          case "text":
          case "email":
          case "password":
          case "textarea":
          case "phone":
          case "color":
            fieldSchema = z.string()
            if (field.pattern) fieldSchema = fieldSchema.regex(new RegExp(field.pattern))
            break
          case "number":
          case "range":
            fieldSchema = z.number()
            if (field.min !== undefined) fieldSchema = fieldSchema.min(field.min)
            if (field.max !== undefined) fieldSchema = fieldSchema.max(field.max)
            break
          case "date":
          case "time":
            fieldSchema = z.string()
            break
          case "select":
          case "radio":
            fieldSchema = z.string()
            break
          case "checkbox":
            if (field.options && field.options.length > 0) {
              fieldSchema = z.array(z.string())
            } else {
              fieldSchema = z.boolean()
            }
            break
          case "file":
            fieldSchema = z.any()
            break
          default:
            fieldSchema = z.string()
        }

        if (field.required) {
          schemaFields[field.id] = fieldSchema
        } else {
          schemaFields[field.id] = fieldSchema.optional()
        }
      })
    })

    return z.object(schemaFields)
  }

  const dynamicSchema = createZodSchema(schema)

  // Create form with react-hook-form and zod resolver
  const form = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {},
  })

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  // Render a field based on its type
  const renderField = (field: any) => {
    switch (field.type) {
      case "text":
      case "email":
      case "password":
      case "phone":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input type={field.type} placeholder={field.placeholder} {...formField} />
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "textarea":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea placeholder={field.placeholder} rows={field.rows || 3} {...formField} />
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "select":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder || "Select an option"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option: any) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "checkbox":
        if (field.options && field.options.length > 0) {
          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <div className="space-y-2">
                    {field.options.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          checked={(formField.value || []).includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValue = formField.value || []
                            const newValue = checked
                              ? [...currentValue, option.value]
                              : currentValue.filter((value: string) => value !== option.value)
                            formField.onChange(newValue)
                          }}
                        />
                        <label>{option.label}</label>
                      </div>
                    ))}
                  </div>
                  {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        } else {
          return (
            <FormField
              key={field.id}
              control={form.control}
              name={field.id}
              render={({ field: formField }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={formField.value} onCheckedChange={formField.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{field.label}</FormLabel>
                    {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          )
        }

      case "radio":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={formField.onChange} defaultValue={formField.value} className="space-y-1">
                    {field.options?.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                        <label htmlFor={`${field.id}-${option.value}`}>{option.label}</label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "date":
      case "time":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input type={field.type} {...formField} />
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "range":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <Slider
                      min={field.min || 0}
                      max={field.max || 100}
                      step={field.step || 1}
                      defaultValue={[formField.value || field.min || 0]}
                      onValueChange={(values) => formField.onChange(values[0])}
                    />
                    <div className="text-center">{formField.value || field.min || 0}</div>
                  </div>
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      case "color":
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.id}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input type="color" className="w-12 h-8 p-1" {...formField} />
                    <Input type="text" value={formField.value} onChange={formField.onChange} className="flex-1" />
                  </div>
                </FormControl>
                {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        )

      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-3xl overflow-y-auto max-h-[90vh]">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{schema.title}</CardTitle>
          {schema.description && <CardDescription>{schema.description}</CardDescription>}
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {schema.sections.map((section: any, index: number) => (
              <div key={index} className="space-y-4">
                {(section.title || section.description) && (
                  <div className="space-y-1">
                    {section.title && <h3 className="text-lg font-medium">{section.title}</h3>}
                    {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
                  </div>
                )}

                <div
                  className={`grid grid-cols-1 ${
                    section.columns === 2 ? "md:grid-cols-2" : section.columns === 3 ? "md:grid-cols-3" : ""
                  } gap-4`}
                >
                  {section.fields.map((field: any) => renderField(field))}
                </div>
              </div>
            ))}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          {schema.cancelButtonText || "Cancel"}
        </Button>
        <Button onClick={handleSubmit}>{schema.submitButtonText || "Submit"}</Button>
      </CardFooter>
    </Card>
  )
}
