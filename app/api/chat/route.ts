import { NextRequest, NextResponse } from "next/server"
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai'
import { toolss } from "@/lib/tools"

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // Call OpenAI with tools
  const completion = await generateText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: toolss,
    toolChoice: "auto",
  });

  // If the response is a tool call:
  const response = completion.response.messages;

  // Check for tool_calls
  // if (response.messages[0.tool_calls && response.tool_calls.length > 0) {
  //   const toolCall = response.tool_calls[0]; // you might support multiple in the future
  //   const toolName = toolCall.function.name;
  //   const args = JSON.parse(toolCall.function.arguments);

  //   // Call your tool's execute function
  //   const toolResult = await toolss[toolName].execute(args);

    // Create the new assistant message with the tool result as the function call output
    const assistantMsg = {
      role: "assistant",
      content: null,
    };

    // Return this as the response to your frontend
    return NextResponse.json(assistantMsg);
  }

  // If not a tool call, just return the response as-is
  return NextResponse.json(response);
}