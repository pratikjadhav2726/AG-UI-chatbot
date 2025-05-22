"use client"
import { useState } from "react"
import { DynamicTemplate } from "@/components/dynamic-template"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function ChatPage() {
  // Accept 'content' as string | array for flexibility
  const [messages, setMessages] = useState<
    { role: string; content: any; id?: string }[]
  >([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { role: "user", content: input }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    })
    const assistantMsg = await res.json()
    setMessages(prev => [...prev, assistantMsg])
    setIsLoading(false)
  }

  return (
    <div className="container py-4">
      <div className="space-y-4 pb-24">
        {messages.map((msg, i) => {
          // Tool response (tool-call result)
          if (msg.role === "tool" && Array.isArray(msg.content)) {
            // Typically, the result is at content[0].result
            const config = msg.content[0]?.result
            if (!config) return null
            return (
              <Card key={i} className="p-4 mr-auto max-w-[80%]">
                <DynamicTemplate
                  config={config}
                  onInteraction={(interaction) => console.log("Interaction:", interaction)}
                  onClose={() => console.log("DynamicTemplate closed")}
                />
              </Card>
            )
          }

          // Default: user/assistant message
          return (
            <Card
              key={i}
              className={`p-4 max-w-[80%] ${
                msg.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto"
              }`}
            >
              {typeof msg.content === "string"
                ? msg.content
                : JSON.stringify(msg.content)}
            </Card>
          )
        })}
      </div>
      <form
        className="fixed bottom-0 left-0 right-0 bg-background border-t p-4"
        onSubmit={handleSend}
      >
        <div className="container flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? "Thinking..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  )
}