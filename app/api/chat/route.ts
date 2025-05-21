import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server" // Import NextResponse
import { createDynamicUIPrompt } from "@/lib/gemini-tools"
// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Create a generative model instance
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    })

    // Prepare the chat history
    const chatHistory = []
    let schemas = createDynamicUIPrompt()
    console.debug("Schemas: ", schemas)
    // Add system message as a user message at the beginning
    chatHistory.push({
      role: "user",
      parts: [
        {
          text: `You are a helpful assistant that can generate dynamic UI components.
          You should use the generateDynamicUI function to create a custom interface when the user asks to *see* data, *create* a UI, or *manage* information.  Do not use generateDynamicUI for simple questions or greetings.

          Here are some examples:

          If the user asks for a dashboard, you should respond with:
          \`\`\`tool_code
          generateDynamicUI(
            templateType='dashboard',
            title='Marketing Performance',
            description='Overview of key marketing metrics',
            dateRange='Last 30 Days',
            metrics=[
              {
                'id': 'visits',
                'label': 'Website Visits',
                'value': '12,345',
                'change': 10,
                'changeType': 'increase'
              },
              {
                'id': 'leads',
                'label': 'New Leads',
                'value': '678',
                'change': -5,
                'changeType': 'decrease'
              }
            ],
            charts=[
              {
                'type': 'line',
                'data': [...]
              }
            ]
          )
          \`\`\`

          The Schemas for the templates are as follows: {schemas}

          Always wrap your generateDynamicUI function call in \`\`\`tool_code\`\`\` blocks.  Make sure the formatting is exactly as shown in the examples, including the newlines and spacing.

          You can generate various types of UI templates including:
          - dashboard: For displaying metrics and KPIs
          - dataTable: For displaying tabular data with sorting and filtering
          - productCatalog: For displaying products with images and details
          - profileCard: For displaying user profiles
          - timeline: For displaying chronological events
          - gallery: For displaying images in a grid or carousel
          - pricing: For displaying pricing plans and options
          - stats: For displaying statistics and metrics
          - calendar: For displaying events or selecting dates
          - wizard: For multi-step processes
          - chart: For data visualization
          - map: For location-based information
          - kanban: For task management
          - feed: For social media style content

          Be thoughtful about what template is most appropriate for the current context and how it should be structured.
          You can specify the content, layout, styling, and interactive elements for each template.

          This is a system message. Now I'll act as a user asking you questions.`,
        },
      ],
    })

    // Add a model response to acknowledge the system message
    chatHistory.push({
      role: "model",
      parts: [
        {
          text: "I understand. I'll act as a helpful assistant that can generate dynamic UI components when appropriate. I'll use the generateDynamicUI function wrapped in tool_code blocks when needed. How can I help you today?",
        },
      ],
    })

    // Convert the messages from the AI SDK format to Gemini format
    const convertedMessages: any[] = []

    for (const message of messages) {
      // Skip the initial welcome message as it's not part of the actual conversation
      if (message.id === "welcome-message") continue

      // Convert role names (user stays user, assistant becomes model)
      const role = message.role === "user" ? "user" : "model"

      convertedMessages.push({
        role,
        parts: [{ text: message.content }],
      })
    }

    // Add all converted messages to the chat history
    chatHistory.push(...convertedMessages)

    // Create the chat session
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
      },
    })

    // Get the last user message
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()

    if (!lastUserMessage) {
      throw new Error("No user message found")
    }

    // Send the message and get the response
    const result = await chat.sendMessage(lastUserMessage.content)
    const response = await result.response
    const text = response.text()

    // Create a ReadableStream from the response text
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text))
        controller.close()
      },
    })

    // Return the stream response using NextResponse
    return new NextResponse(stream)
  } catch (error) {
    console.error("Error in chat route:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to generate response", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const config = {
  runtime: 'edge',
};
