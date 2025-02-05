import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

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

// async function loadContextFiles() {
//   try {
//     const sourcesDir = path.join(process.cwd(), 'public', 'sources')

//     console.log('📚 Loading context files from:', sourcesDir)

//     // Read and combine all .md files from the sources directory
//     const files = await fs.readdir(sourcesDir)
//     const mdFiles = files.filter(file => file.endsWith('.md'))

//     console.log('📑 Found markdown files:', mdFiles)

//     const contents = await Promise.all(
//       mdFiles.map(async file => {
//         const content = await fs.readFile(path.join(sourcesDir, file), 'utf-8')
//         console.log(`✅ Loaded ${file}: ${content.length} characters`)
//         return `# ${file}\n\n${content}`
//       })
//     )

//     return contents.join('\n\n')
//   } catch (error) {
//     console.error('❌ Error loading context files:', error)
//     throw error
//   }
// }

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
    const { message, conversationId } = body

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

    const apiKey = process.env.NEXT_PUBLIC_FATOU_API_KEY
    if (!apiKey) {
      console.error('❌ Missing Fatou API key in environment')
      return NextResponse.json(
        {
          message: 'Server configuration error: Missing API key',
          error: 'MISSING_API_KEY',
        },
        { status: 500 }
      )
    }

    const formData = new FormData()
    formData.append('message', message)

    if (conversationId) {
      formData.append('conversationId', conversationId)
    }

    console.log('📡 Sending request to Fatou API...')
    const response = await fetch('http://193.108.55.119:3000/ai/ask', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
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
