"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DynamicTemplate } from "@/components/dynamic-template"
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageSquare,
  Code,
  Eye,
  Loader2,
  Layout,
  Database,
  BarChart3,
  FileText,
  Users,
  Calendar,
  Map,
  ShoppingCart,
  Palette
} from "lucide-react"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  toolCalls?: any[]
  toolResults?: any[]
  generatedTemplate?: any
}

interface MCPChatbotProps {
  onTemplateGenerated?: (template: any) => void
}

export function MCPChatbot({ onTemplateGenerated }: MCPChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hello! I'm your AI UI Template Assistant powered by our MCP (Model Context Protocol) server.

I can help you generate dynamic UI templates for any use case! Here's what I can create:

🎛️ **Dashboards** - Business metrics and analytics
📊 **Data Tables** - Sortable, filterable tables  
🛍️ **Product Catalogs** - E-commerce listings
📝 **Forms** - Multi-step forms with validation
📈 **Analytics** - KPI dashboards with insights
👤 **Profile Cards** - User profile displays
📅 **Calendars** - Event scheduling interfaces
🗺️ **Maps** - Interactive location displays
📱 **And 12+ more template types!**

**What can I help you create today?** Just describe what you need, or ask me to:
- "Show me all available templates"
- "Create a dashboard for sales metrics"
- "Generate a registration form"
- "Build an analytics dashboard"

Let's build something amazing together! ✨`,
      timestamp: new Date()
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplate, setShowTemplate] = useState<any>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/mcp-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot')
      }

      const data = await response.json()
      
      // Check if a template was generated
      let generatedTemplate = null
      if (data.toolResults) {
        const templateResult = data.toolResults.find((result: any) => 
          result.result?.template && result.result?.success
        )
        if (templateResult) {
          generatedTemplate = templateResult.result.template
          if (onTemplateGenerated) {
            onTemplateGenerated(generatedTemplate)
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || 'I apologize, but I encountered an issue generating a response.',
        timestamp: new Date(),
        toolCalls: data.toolCalls,
        toolResults: data.toolResults,
        generatedTemplate
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      // Focus back to input
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getTemplateIcon = (templateType: string) => {
    const iconMap: Record<string, any> = {
      dashboard: BarChart3,
      dataTable: Database,
      form: FileText,
      analytics: BarChart3,
      productCatalog: ShoppingCart,
      calendar: Calendar,
      map: Map,
      profileCard: Users,
      chart: BarChart3,
      default: Layout
    }
    
    const IconComponent = iconMap[templateType] || iconMap.default
    return <IconComponent className="h-4 w-4" />
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const suggestionPrompts = [
    "Show me all available templates",
    "Create a dashboard for sales metrics", 
    "Generate a user registration form",
    "Build an analytics dashboard for website traffic",
    "Create a product catalog for an e-commerce store",
    "Design a calendar for event scheduling"
  ]

  const handleSuggestionClick = (prompt: string) => {
    setInputValue(prompt)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className="flex flex-col h-[800px] max-w-4xl mx-auto">
      {/* Header */}
      <Card className="rounded-b-none border-b-0">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                MCP UI Template Assistant
                <Badge variant="secondary" className="text-xs">
                  Powered by Claude 4 Sonnet
                </Badge>
              </CardTitle>
              <CardDescription>
                Generate dynamic UI templates using our MCP server
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 rounded-none border-x border-t-0 border-b-0">
        <CardContent className="p-0 h-full">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className="space-y-3">
                  <div className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] space-y-2 ${
                      message.role === 'user' ? 'order-1' : ''
                    }`}>
                      <div className={`p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                      
                      {/* Tool Results Display */}
                      {message.toolResults && message.toolResults.length > 0 && (
                        <div className="space-y-2">
                          {message.toolResults.map((result: any, resultIndex: number) => (
                            <div key={resultIndex}>
                              {/* Template Lists */}
                              {result.result?.templates && (
                                <Card className="border-l-4 border-l-blue-500">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <Layout className="h-4 w-4" />
                                      Available Templates
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    {result.result.templates.slice(0, 6).map((template: any, templateIndex: number) => (
                                      <div key={templateIndex} className="p-3 bg-muted/50 rounded-lg">
                                        <div className="flex items-start gap-2">
                                          {getTemplateIcon(template.type)}
                                          <div className="flex-1">
                                            <div className="font-medium text-sm">{template.name}</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {template.description}
                                            </div>
                                            {template.useCases && (
                                              <div className="flex flex-wrap gap-1 mt-2">
                                                {template.useCases.slice(0, 3).map((useCase: string, ucIndex: number) => (
                                                  <Badge key={ucIndex} variant="outline" className="text-xs">
                                                    {useCase}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </CardContent>
                                </Card>
                              )}

                              {/* Generated Template */}
                              {result.result?.template && result.result?.success && (
                                <Card className="border-l-4 border-l-green-500">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      {getTemplateIcon(result.result.template.templateType)}
                                      Generated: {result.result.template.title}
                                      <Badge variant="secondary" className="text-xs">
                                        {result.result.template.templateType}
                                      </Badge>
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      <p className="text-sm text-muted-foreground">
                                        {result.result.template.description}
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setShowTemplate(result.result.template)}
                                          className="text-xs"
                                        >
                                          <Eye className="h-3 w-3 mr-1" />
                                          Preview
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              JSON.stringify(result.result.template, null, 2)
                                            )
                                          }}
                                          className="text-xs"
                                        >
                                          <Code className="h-3 w-3 mr-1" />
                                          Copy Config
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating response...
                    </div>
                  </div>
                </div>
              )}

              {/* Suggestions (only show when there are few messages) */}
              {messages.length <= 2 && (
                <div className="space-y-3">
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      💡 Try these suggestions:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {suggestionPrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="text-left h-auto p-3 text-xs justify-start"
                          onClick={() => handleSuggestionClick(prompt)}
                        >
                          <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="rounded-t-none border-t-0">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the UI template you'd like to create..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {showTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-auto">
            <DynamicTemplate
              config={showTemplate}
              onInteraction={(data) => {
                console.log('Template interaction:', data)
                // Add template interaction to chat as user message
                const interactionMessage: Message = {
                  id: Date.now().toString(),
                  role: 'user',
                  content: `Template interaction: ${JSON.stringify(data, null, 2)}`,
                  timestamp: new Date()
                }
                setMessages(prev => [...prev, interactionMessage])
              }}
              onClose={() => setShowTemplate(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
