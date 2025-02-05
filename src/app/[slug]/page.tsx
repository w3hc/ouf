'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Container, Box, Button, Flex, Input, VStack, Text, useToast } from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import { SendIcon } from 'lucide-react'
import pages from '../../../pages.json'
import Image from 'next/image'

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

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => (
  <Box w="full" py={6}>
    <Container maxW="container.md" px={4}>
      <Text color={isUser ? 'blue.400' : 'white'} whiteSpace="pre-wrap">
        {message}
      </Text>
    </Container>
  </Box>
)

export default function AssistantPage({ params }: PageProps) {
  const { slug } = params
  const toast = useToast()

  if (!pages.includes(slug)) {
    notFound()
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      text: `Hello! I'm ${slug}. How can I help you today?`,
      isUser: false,
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

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

      // Add error message to chat
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
      {/* Messages */}
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

      {/* Input Form */}
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
