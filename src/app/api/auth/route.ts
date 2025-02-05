import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, address, message, signature } = body
    const FATOU_API_URL = process.env.NEXT_PUBLIC_FATOU_API_URL

    // Handle getMessage request
    if (action === 'getMessage') {
      const response = await fetch(`${FATOU_API_URL}/auth/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      })

      const data = await response.json()
      return NextResponse.json(data)
    }

    // Handle verify request
    if (action === 'verify') {
      const response = await fetch(`${FATOU_API_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          signature,
          address,
        }),
      })

      const data = await response.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
