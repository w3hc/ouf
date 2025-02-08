import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { getAddress } from 'ethers'

interface FatouResponse {
  answer: string
  usage: {
    costs: {
      inputCost: number
      outputCost: number
      totalCost: number
      inputTokens: number
      outputTokens: number
    }
    timestamp: string
  }
  conversationId: string
}

const FATOU_API_URL = process.env.NEXT_PUBLIC_FATOU_API_URL

// Handle OPTIONS requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    },
  })
}

export async function POST(request: NextRequest) {
  console.log('📝 Incoming request:', {
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString(),
  })

  try {
    const body = await request.json()
    const { message, conversationId, walletAddress, contextId } = body

    const checksummedAddress = getAddress(walletAddress)
    console.log('Making request with checksummed address:', checksummedAddress)

    if (!message) {
      console.warn('❌ Missing message in request body')
      return NextResponse.json(
        {
          message: 'Message is required',
          receivedBody: body,
        },
        { status: 400 }
      )
    }

    if (!walletAddress || !contextId) {
      console.warn('❌ Missing required authentication parameters')
      return NextResponse.json(
        {
          message: 'Wallet address and contextId are required',
          error: 'MISSING_AUTH_PARAMS',
        },
        { status: 400 }
      )
    }

    const formData = new FormData()
    formData.append('message', message)

    if (conversationId) {
      formData.append('conversationId', conversationId)
    }

    console.log('📡 Sending request to Fatou API...', {
      checksummedAddress,
      contextId,
      url: `${FATOU_API_URL}/ai/ask`,
    })
    const response = await fetch(`${FATOU_API_URL}/ai/ask`, {
      method: 'POST',
      headers: {
        'x-wallet-address': checksummedAddress,
        'x-context-id': contextId,
      },
      body: formData,
    })

    console.log('🔍 Fatou API response status:', response.status)
    console.log('🔍 Fatou API response headers:', Object.fromEntries(response.headers))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Fatou API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      return NextResponse.json(
        {
          message: `Fatou API error: ${response.status} ${response.statusText}`,
          error: errorText,
        },
        { status: response.status }
      )
    }

    const data: FatouResponse = await response.json()
    console.log('✅ Fatou API response received:', {
      conversationId: data.conversationId,
      answerLength: data.answer.length,
      usage: data.usage,
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error in API handler:', {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        type: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
