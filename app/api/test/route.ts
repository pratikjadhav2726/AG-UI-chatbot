import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    method: "GET"
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    return NextResponse.json({
      message: "Test POST endpoint working",
      timestamp: new Date().toISOString(),
      method: "POST",
      receivedBody: body
    })
  } catch (error) {
    return NextResponse.json({
      message: "Test POST endpoint working (no JSON body)",
      timestamp: new Date().toISOString(),
      method: "POST",
      error: "No JSON body"
    })
  }
}
