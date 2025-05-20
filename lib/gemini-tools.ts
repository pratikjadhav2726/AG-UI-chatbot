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
    // 1. Find the opening "(" and the matching ")"
    const start = toolCode.indexOf("(")
    const end = toolCode.lastIndexOf(")")
    if (start === -1 || end === -1) throw new Error("Malformed tool_code")

    // 2. Extract just the args: "a=1, b=[...], c='hello'" etc
    const argString = toolCode.slice(start + 1, end).trim()

    // 3. Build a JSON‑like object literal string
    let jsonLike = `{${argString}}`
      // quote unquoted keys: foo= → "foo":
      .replace(/(\w+)\s*=/g, '"$1":')
      // single → double quotes, but avoid double-encoding existing double quotes
      .replace(/'([^"']*)'/g, '"$1"')
      // Python → JS literals
      .replace(/\bTrue\b/g, "true")
      .replace(/\bFalse\b/g, "false")
      .replace(/\bNone\b/g, "null")

    // 4. Parse it!
    return JSON.parse(jsonLike)
  } catch (err) {
    console.error("Error parsing tool_code:", err, toolCode)
    return null
  }
}
