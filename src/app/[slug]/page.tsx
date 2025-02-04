'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Container, Box, Button, Flex, Input, VStack, Text } from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
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

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isUser }) => (
  // <Box w="full" py={6} borderBottom="1px solid" borderColor="gray.800">
  <Box w="full" py={6}>
    <Box maxW="container.md" mx="auto">
      <Text color={isUser ? 'blue.400' : 'white'} whiteSpace="pre-wrap">
        {message}
      </Text>
    </Box>
  </Box>
)

export default function AssistantPage({ params }: PageProps) {
  const { slug } = params

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

    // Simulate API call delay
    setTimeout(() => {
      const assistantMessage: Message = {
        text: `As ${slug}, I acknowledge your message. This is a placeholder response as the actual API integration is pending. This is a placeholder response as the actual API integration is pending. This is a placeholder response as the actual API integration is pending. This is a placeholder response as the actual API integration is pending.`,
        isUser: false,
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1000)
  }

  return (
    <Box minH="calc(100vh - 80px)" display="flex" flexDirection="column">
      {/* Edit Button */}
      <Flex position="fixed" top="80px" right={4} zIndex={10}>
        <Link href={`/${slug}/edit`}>
          <Button
            size="sm"
            bg="red.500"
            color="white"
            _hover={{
              bg: 'red.600',
            }}
          >
            Edit
          </Button>
        </Link>
      </Flex>

      {/* Messages */}
      <Box flex="1" overflowY="auto">
        <VStack spacing={0} align="stretch">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message.text} isUser={message.isUser} />
          ))}
          {isTyping && (
            // <Box p={6} borderBottom="1px solid" borderColor="gray.800">
            // <Box p={6}>
            <Box p={0}>
              <Box maxW="container.md" mx="auto">
                <Image priority width="120" height="120" alt="loader" src="/loader.svg" />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Input Form */}
      {/* <Box as="form" onSubmit={handleSubmit} borderTop="1px solid" borderColor="gray.800" p={4}> */}
      <Box as="form" onSubmit={handleSubmit} p={4}>
        <Flex maxW="container.md" mx="auto" gap={2}>
          <Input
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            size="lg"
            // border="1px solid"
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
      </Box>
    </Box>
  )
}
