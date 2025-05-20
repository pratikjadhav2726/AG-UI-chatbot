// This file contains helper functions for working with Gemini and function calling

// import { console } from "inspector"

export function createDynamicUIPrompt(templateType: string) {
  const templatePrompts: Record<string, string> = {
    dashboard: `Create a dashboard template with metrics, charts, and recent activity.`,
    dataTable: `Create a data table template with columns, data, and pagination.`,
    productCatalog: `Create a product catalog template with products, categories, and sorting options.`,
    profileCard: `Create a profile card template with user information and actions.`,
    timeline: `Create a timeline template with events and filtering options.`,
    gallery: `Create a gallery template with images and layout options.`,
    pricing: `Create a pricing template with plans and features.`,
    stats: `Create a stats template with statistics and metrics.`,
    calendar: `Create a calendar template with events and view options.`,
    wizard: `Create a wizard template with steps and navigation.`,
    chart: `Create a chart template with data visualization options.`,
    map: `Create a map template with markers and controls.`,
    kanban: `Create a kanban template with columns and cards.`,
    feed: `Create a feed template with posts and interactions.`,
  }

  return templatePrompts[templateType] || `Create a ${templateType} template with appropriate content and structure.`
}

export function parseGeminiResponse(content: string) {
  try {
    // Look for JSON-like content between triple backticks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    }

    // Look for JSON-like content between curly braces
    const jsonPattern = /\{[\s\S]*\}/
    const match = content.match(jsonPattern)
    if (match) {
      return JSON.parse(match[0])
    }

    return null
  } catch (error) {
    console.error("Error parsing JSON from Gemini response:", error)
    return null
  }
}

// Parse tool_code format from Gemini
export function parseToolCode(toolCode: string) {
  try {
    console.log("Parsing tool code:", toolCode)

    // Extract function name and arguments
    const functionMatch = toolCode.match(/(\w+)\(([\s\S]*)\)/)
    if (!functionMatch) {
      console.error("Invalid tool_code format:", toolCode)
      return null
    }

    const functionName = functionMatch[1]
    const argsString = functionMatch[2]

    console.log("Function name:", functionName)
    console.log("Args string:", argsString)

    // Only process generateDynamicUI function calls
    if (functionName !== "generateDynamicUI") {
      console.error("Unexpected function in tool_code:", functionName)
      return null
    }

    // Parse the arguments
    const config: Record<string, any> = {}

    // Handle named parameters with regex
    // This regex matches parameter names followed by values that can be:
    // - Quoted strings (single or double quotes)
    // - Arrays [...]
    // - Objects {...}
    // - Other values without commas
    const namedParamRegex = /(\w+)=(?:'([^']*)'|"([^"]*)"|([[{][\s\S]*?[\]}])|([^,)]+))/g
    let match

    while ((match = namedParamRegex.exec(argsString)) !== null) {
      const paramName = match[1]
      // Get the value from whichever capturing group matched
      const paramValue = match[2] || match[3] || match[4] || match[5]

      console.debug(`Param ${paramName}:`, paramValue)

      try {
        // Try to parse as JSON if it looks like an object or array
        if (paramValue.startsWith("[") || paramValue.startsWith("{")) {
          // Replace Python syntax with JavaScript syntax
          console.debug("Parsing as JSON:", paramValue)
          const jsValue = paramValue
            .replace(/'/g, '"')
            .replace(/True/g, "true")
            .replace(/False/g, "false")
            .replace(/None/g, "null")

          config[paramName] = JSON.parse(jsValue)
        } else {
          // Otherwise use the string value
          config[paramName] = paramValue
        }
      } catch (e) {
        console.error("Error parsing parameter value:", e)
        // If JSON parsing fails, use the raw string
        config[paramName] = paramValue
      }
    }

    console.log("Parsed config:", config)

    // Convert sections to the format expected by our templates
    if (config.sections) {
      // Map the sections to the format our templates expect
      const adaptedConfig = {
        templateType: config.templateType || "dashboard",
        title: config.title || "Dashboard",
        description: config.description || "",
        metrics: [] as Array<{
          id: string
          label: any
          value: any
          change: number
          changeType: string
        }>,
        charts: [] as Array<{
          id: string
          type: any
          title: any
          data: any
          height: number
        }>,
        recentActivity: [],
      }

      console.log("Processing sections:", config.sections)

      // Process sections to extract metrics, charts, etc.
      config.sections.forEach((section: any) => {
        if (section.components) {
          section.components.forEach((component: any) => {
            if (component.type === "stat") {
              adaptedConfig.metrics.push({
                id: `metric-${adaptedConfig.metrics.length}`,
                label: component.title,
                value: component.value,
                change: Number.parseFloat(component.percentageChange?.replace("%", "") || "0"),
                changeType: component.trend === "up" ? "increase" : "decrease",
              })
            } else if (component.type === "chart") {
              adaptedConfig.charts.push({
                id: `chart-${adaptedConfig.charts.length}`,
                type: component.chartType,
                title: component.options?.title || "Chart",
                data: component.data,
                height: 200,
              })
            } else if (component.type === "dataTable") {
              // Handle data tables
              // This is just an example - adapt to your needs
            }
          })
        }
      })

      console.log("Adapted config:", adaptedConfig)
      return adaptedConfig
    }

    return config
  } catch (error) {
    console.error("Error parsing tool_code:", error, toolCode)
    return null
  }
}
