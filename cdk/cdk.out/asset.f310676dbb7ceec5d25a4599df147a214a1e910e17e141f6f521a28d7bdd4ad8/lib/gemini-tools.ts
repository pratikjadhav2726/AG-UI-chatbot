// This file contains helper functions for working with Gemini and function calling

import { getTemplateSchema, getTemplateExample } from "./template-schemas"

export function createDynamicUIPrompt() {
  const templateTypes = [
    "dashboard",
    "dataTable",
    "productCatalog",
    "profileCard",
    "timeline",
    "gallery",
    "pricing",
    "stats",
    "calendar",
    "wizard",
    "chart",
    "map",
    "kanban",
    "feed",
  ]

  let schemaInfo = ""

  templateTypes.forEach((type) => {
    const schema = getTemplateSchema(type)
    const example = getTemplateExample(type)

    if (!schema.error) {
      schemaInfo += `\n## ${type} Template\n`
      schemaInfo += `Required fields: ${schema.required?.join(", ") || "None"}\n\n`

      if (schema.properties) {
        schemaInfo += "Key properties:\n"
        Object.entries(schema.properties).forEach(([key, prop]) => {
          schemaInfo += `- ${key}: ${(prop as any).description || "No description"}\n`
        })
      }

      if (!example.error) {
        schemaInfo += "\nExample:\n```json\n"
        schemaInfo += JSON.stringify(example, null, 2)
        schemaInfo += "\n```\n"
      }
    }
  })

  return schemaInfo
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
