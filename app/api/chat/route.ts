// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server"
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai'
import { toolss } from "@/lib/tools"

// const openai_ = new openai({ apiKey: process.env.OPENAI_API_KEY! })

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const completion = await generateText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: toolss, 
    toolChoice: "auto",
  })

  // Return the assistant message (as JSON)
  return NextResponse.json(completion.response.messages)
}