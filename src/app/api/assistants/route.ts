import { NextRequest, NextResponse } from 'next/server'

const FATOU_API_URL = process.env.NEXT_PUBLIC_FATOU_API_URL

export async function GET() {
  try {
    const response = await fetch(`${FATOU_API_URL}/api-keys/details`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Fatou API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching assistants:', error)
    return NextResponse.json({ error: 'Failed to fetch assistants' }, { status: 500 })
  }
}
