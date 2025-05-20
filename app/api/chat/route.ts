// Two simple mock responses
const MOCK_RESPONSES = [
  // Simple text response
  "This is a simple text response from the mock API.",

  // Response with a tool call
  `\`\`\`tool_code
generateDynamicUI(
  templateType="dashboard",
  title="Simple Dashboard",
  description="A basic dashboard example",
  metrics=[
    {
      "id": "metric1",
      "label": "Total Users",
      "value": "1,234",
      "icon": "users"
    },
    {
      "id": "metric2",
      "label": "Revenue",
      "value": "$5,678",
      "icon": "dollar"
    }
  ]
)
\`\`\``,
]

// Simple counter to alternate between responses
let counter = 0

export async function POST(req: Request) {
  try {
    // Get the next response (alternating between the two)
    const responseText = MOCK_RESPONSES[counter % MOCK_RESPONSES.length]

    // Update counter for next request
    counter = (counter + 1) % MOCK_RESPONSES.length

    // Return a simple text response (no streaming)
    return new Response(responseText)
  } catch (error) {
    console.error("Error in chat route:", error)

    // Return a simple error response
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
