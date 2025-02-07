import { NextRequest, NextResponse } from 'next/server'

const FATOU_API_URL = process.env.NEXT_PUBLIC_FATOU_API_URL

export async function GET() {
  try {
    const response = await fetch(`${FATOU_API_URL}/api-keys/details`, {
      cache: 'no-store', // Prevent caching
    })

    if (!response.ok) {
      throw new Error(`Fatou API error: ${response.status}`)
    }

    // Just pass through whatever Fatou sends
    const data = await response.json()
    console.log('Direct Fatou response:', data)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to fetch assistants' }, { status: 500 })
  }
}
