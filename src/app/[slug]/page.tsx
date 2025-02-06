'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Container, Box, Button, Flex, Input, VStack, Text, useToast, Link } from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import { SendIcon } from 'lucide-react'
import pages from '../../../pages.json'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import { useAppKitAccount } from '@reown/appkit/react'

interface Assistant {
  slug: string
  name: string
  introPhrase: string
  contextId: string
  daoAddress: string
  daoNetwork: string
}

async function validateAssistant(slug: string): Promise<Assistant | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_FATOU_API_URL}/api-keys/details`)
    if (!response.ok) {
      return null
    }
    const assistants = await response.json()
    return assistants.find((assistant: Assistant) => assistant.slug === slug) || null
  } catch (error) {
    console.error('Error validating assistant:', error)
    return null
  }
}

interface Message {
  text: string
  isUser: boolean
}

interface ChatMessageProps {
  message: string
  isUser: boolean
}

interface PageProps {
  params: {
    slug: string
  }
}

interface ApiResponse {
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

const MarkdownComponents = {
  p: (props: any) => (
    <Text mb={2} lineHeight="tall" color="inherit">
      {props.children}
    </Text>
  ),
  h1: (props: any) => (
    <Text as="h1" fontSize="2xl" fontWeight="bold" my={4} color="inherit">
      {props.children}
    </Text>
  ),
  h2: (props: any) => (
    <Text as="h2" fontSize="xl" fontWeight="bold" my={3} color="inherit">
      {props.children}
    </Text>
  ),
  h3: (props: any) => (
    <Text as="h3" fontSize="lg" fontWeight="bold" my={2} color="inherit">
      {props.children}
    </Text>
  ),
  ul: (props: any) => (
    <Box as="ul" pl={4} my={2}>
      {props.children}
    </Box>
  ),
  ol: (props: any) => (
    <Box as="ol" pl={4} my={2}>
      {props.children}
    </Box>
  ),
  li: (props: any) => (
    <Box as="li" mb={1}>
      {props.children}
    </Box>
  ),
  blockquote: (props: any) => (
    <Box borderLeftWidth="4px" borderLeftColor="gray.200" pl={4} py={2} my={4}>
      {props.children}
    </Box>
  ),
  code: ({ inline, className, children }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''

    if (inline) {
      return (
        <Text as="code" px={1} bg="gray.700" borderRadius="sm" fontSize="0.875em">
          {children}
        </Text>
      )
    }

    return (
      <Box my={4}>
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{ borderRadius: '8px' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </Box>
    )
  },
  pre: (props: any) => <Box {...props} />,
  strong: (props: any) => (
    <Text as="strong" fontWeight="bold">
      {props.children}
    </Text>
  ),
  em: (props: any) => (
    <Text as="em" fontStyle="italic">
      {props.children}
    </Text>
  ),
  a: (props: any) => (
    <Link
      color="blue.300"
      href={props.href}
      isExternal
      textDecoration="underline"
      _hover={{
        color: 'blue.200',
        textDecoration: 'none',
      }}
      onClick={e => {
        if (!props.href || props.href === '#') {
          e.preventDefault()
          return
        }
      }}
    >
      {props.children}
    </Link>
  ),
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => (
  <Box w="full" py={6}>
    <Container maxW="container.md" px={4}>
      <Box
        color={
          isUser ? 'blue.400' : message === 'Please login to chat with me! 😉' ? 'red.400' : 'white'
        }
      >
        {isUser ? (
          <Text whiteSpace="pre-wrap">{message}</Text>
        ) : (
          <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
            {message}
          </ReactMarkdown>
        )}
      </Box>
    </Container>
  </Box>
)

export default function AssistantPage({ params }: PageProps) {
  const { slug } = params
  const { address, isConnected } = useAppKitAccount()
  const toast = useToast()
  const [assistantData, setAssistantData] = useState<Assistant | null>(null)

  useEffect(() => {
    const checkAssistant = async () => {
      const data = await validateAssistant(slug)
      if (!data) {
        notFound()
      }
      setAssistantData(data)
    }
    checkAssistant()
  }, [slug])

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Set initial message when assistant data is loaded
  useEffect(() => {
    if (assistantData) {
      setMessages([
        {
          text:
            assistantData.introPhrase ||
            `Hello! I'm ${assistantData.name || assistantData.slug}. How can I help you today? I speak more than 100 languages so feel free to use your own!`,
          isUser: false,
        },
      ])
    }
  }, [assistantData])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) {
      return
    }

    if (!address) {
      const loginMessage: Message = {
        text: 'Please login to chat with me! 😉',
        isUser: false,
      }
      setMessages(prev => [...prev, loginMessage])
      return
    }

    const userMessage: Message = {
      text: inputValue,
      isUser: true,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const formData = new FormData()
      formData.append('message', inputValue)
      if (conversationId) {
        formData.append('conversationId', conversationId)
      }

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationId: conversationId,
          walletAddress: address || '',
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ApiResponse = await response.json()

      setConversationId(data.conversationId)

      const assistantMessage: Message = {
        text: data.answer,
        isUser: false,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error calling API:', error)
      toast({
        title: 'Error',
        description: 'Failed to get response from assistant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })

      const errorMessage: Message = {
        text: 'Sorry, I encountered an error processing your request. Please try again.',
        isUser: false,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Box minH="calc(100vh - 80px)" display="flex" flexDirection="column" bg="black">
      <Box flex="1" overflowY="auto" px={4}>
        <Container maxW="container.md" h="full" px={0}>
          <VStack spacing={0} align="stretch">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message.text} isUser={message.isUser} />
            ))}
            {isTyping && (
              <Box p={0}>
                <Container maxW="container.md" mx="auto">
                  <Image priority width="120" height="120" alt="loader" src="/loader.svg" />
                </Container>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Container>
      </Box>

      <Box as="form" onSubmit={handleSubmit} p={4}>
        <Container maxW="container.md" mx="auto">
          <Flex gap={2}>
            <Input
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              size="lg"
              borderColor="gray.700"
              _focus={{
                borderColor: 'blue.500',
                boxShadow: 'none',
              }}
            />
            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isDisabled={!inputValue.trim() || isTyping}
            >
              <SendIcon size={20} />
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}
