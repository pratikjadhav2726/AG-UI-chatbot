"use client";
import { useState } from "react";
import { DynamicTemplate } from "@/components/dynamic-template";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  const [messages, setMessages] = useState<
    { role: string; content: any; id?: string; type?: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const newMessages = await res.json();

      // Check if the response is a single message or an array of messages
      if (Array.isArray(newMessages)) {
        setMessages((prev) => [...prev, ...newMessages]); // Add all messages if it's an array
      } else {
        setMessages((prev) => [...prev, newMessages]); // Add a single message if it's an object
      }
    } catch (error) {
      console.error("Error fetching assistant message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="space-y-4 pb-24">
        {messages.map((msg, i) => {
          // Skip tool-result messages
          if (msg.role === "tool") {
            return null; // Do not render tool-result messages
          }

          // Check if the message contains a tool-call
          if (
            msg.role === "assistant" &&
            Array.isArray(msg.content) &&
            msg.content[0]?.type === "tool-call"
          ) {
            const config = msg.content[0]?.args; // Extract the tool-call arguments
            if (!config) return null; // Skip if no valid config
            return (
              <Card key={i} className="p-4 mr-auto max-w-[80%]">
                <DynamicTemplate
                  config={config}
                  onInteraction={(interaction) =>
                    console.log("Interaction:", interaction)
                  }
                  onClose={() => console.log("DynamicTemplate closed")}
                />
              </Card>
            );
          }

          // Check if the message contains text content
          if (
            msg.role === "assistant" &&
            Array.isArray(msg.content) &&
            msg.content[0]?.type === "text"
          ) {
            const textContent = msg.content[0]?.text; // Extract the text content
            return (
              <Card
                key={i}
                className="p-4 mr-auto max-w-[80%]"
              >
                {textContent}
              </Card>
            );
          }

          // Default: Render plain text for assistant/user messages
          return (
            <Card
              key={i}
              className={`p-4 max-w-[80%] ${
                msg.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground"
                  : "mr-auto"
              }`}
            >
              {typeof msg.content === "string"
                ? msg.content // Render plain text
                : JSON.stringify(msg.content)} {/* Fallback for non-string content */}
            </Card>
          );
        })}
      </div>
      <form
        className="fixed bottom-0 left-0 right-0 bg-background border-t p-4"
        onSubmit={handleSend}
      >
        <div className="container flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
  );
}