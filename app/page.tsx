"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DynamicTemplate } from "@/components/dynamic-template"
import { parseToolCode } from "@/lib/gemini-tools"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Message type definition
interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  // State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-message",
      role: "assistant",
      content: "Hello! I'm your AI assistant. What would you like to see today?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [templateConfig, setTemplateConfig] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showRawResponse, setShowRawResponse] = useState(false)
  const [debugMode, setDebugMode] = useState(true)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      // Call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      // Get the response text
      const responseText = await response.text()

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      console.error("Error sending message:", err)
      setError(err.message || "An error occurred while sending your message")
    } finally {
      setIsLoading(false)
    }
  }

  // Extract template configuration from message content
  const extractTemplateConfig = (content: string) => {
    try {
      // Check for tool_code format
      const toolCodeMatch = content.match(/```tool_code\s*([\s\S]*?)\s*```/)
      if (toolCodeMatch && toolCodeMatch[1]) {
        return parseToolCode(toolCodeMatch[1])
      }
      return null
    } catch (error) {
      console.error("Error parsing template configuration:", error)
      return null
    }
  }

  // Handle template interaction
  const handleTemplateInteraction = (data: any) => {
    // Add user message about the interaction
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I interacted with the ${templateConfig.templateType} template: ${JSON.stringify(data)}`,
    }

    setMessages((prev) => [...prev, userMessage])
    setTemplateConfig(null)
  }

  // Check for template configurations in messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        // Try to extract template configuration from the message
        const config = extractTemplateConfig(lastMessage.content)
        if (config && config.templateType) {
          setTemplateConfig(config)
        }
      }
    }
  }, [messages])

  // Toggle raw response display
  const toggleRawResponse = () => {
    setShowRawResponse(!showRawResponse)
  }

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode(!debugMode)
  }

  // Function to render message content
  const renderMessageContent = (message: Message) => {
    if (message.role === "assistant" && showRawResponse) {
      // Show raw response for debugging
      return (
        <>
          <div className="mb-2 pb-2 border-b">
            <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">Raw Response:</span>
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto max-h-[300px]">{message.content}</pre>
        </>
      )
    }

    // Check if the message contains tool_code and we're not showing raw response
    if (message.role === "assistant" && !showRawResponse && message.content.includes("```tool_code")) {
      // Extract and display only the text before the tool_code block
      const parts = message.content.split("```tool_code")
      if (parts.length > 1 && parts[0].trim()) {
        return <div className="whitespace-pre-wrap">{parts[0].trim()}</div>
      }
    }

    // Default rendering
    return <div className="whitespace-pre-wrap">{message.content}</div>
  }

  // Add a test message
  const addTestMessage = () => {
    const testMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "This is a test message to verify rendering is working correctly.",
    }

    setMessages((prev) => [...prev, testMessage])
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mock UI Templates Demo</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleRawResponse}>
              {showRawResponse ? "Hide Raw Responses" : "Show Raw Responses"}
            </Button>
            <Button variant="outline" size="sm" onClick={toggleDebugMode}>
              {debugMode ? "Hide Debug" : "Show Debug"}
            </Button>
            <Button variant="secondary" size="sm" onClick={addTestMessage}>
              Add Test Message
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-4 relative">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Info Panel */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h2 className="text-lg font-medium mb-2">Mock UI Templates Demo</h2>
          <p className="text-sm mb-2">
            This demo uses mock responses to simulate an AI assistant that can generate dynamic UI components. The
            responses alternate between normal text messages and tool calls that display UI components.
          </p>
          <p className="text-sm">Try sending any message to see the next response in the sequence.</p>
        </div>

        {/* Debug Panel */}
        {debugMode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-xs font-mono">
            <div className="font-bold mb-1">Debug Info:</div>
            <div>Message Count: {messages.length}</div>
            <div>Loading: {isLoading ? "Yes" : "No"}</div>
            <div>Template Config: {templateConfig ? templateConfig.templateType : "None"}</div>
            <div>Error: {error ? error : "None"}</div>
          </div>
        )}

        <ScrollArea className="h-[calc(100vh-20rem)]">
          <div className="space-y-4 pb-24">
            {messages.map((message, index) => (
              <Card
                key={`${message.id}-${index}`}
                className={cn(
                  "p-4 max-w-[80%]",
                  message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto",
                )}
              >
                <div className="text-xs text-muted-foreground mb-1">{message.role}</div>
                {renderMessageContent(message)}
              </Card>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Dynamic Template Overlay */}
        {templateConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10 p-4">
            <DynamicTemplate
              config={templateConfig}
              onInteraction={handleTemplateInteraction}
              onClose={() => setTemplateConfig(null)}
            />
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <form onSubmit={handleSubmit} className="container flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={isLoading ? "Waiting for response..." : "Type a message..."}
              className="flex-1"
              disabled={isLoading || !!templateConfig}
            />
            <Button type="submit" disabled={isLoading || !!templateConfig || !input.trim()}>
              {isLoading ? "Thinking..." : "Send"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
