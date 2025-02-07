'use client'

import {
  Container,
  Text,
  Heading,
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from '@reown/appkit/react'

interface Assistant {
  slug: string
  name: string
  introPhrase: string
  contextId: string
  daoAddress: string
  daoNetwork: string
  adminAddress: string
}

export default function Create() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [assistantData, setAssistantData] = useState<Assistant[]>([])
  const [formData, setFormData] = useState({
    slug: '',
    assistantName: '',
    introPhrase: '',
    daoAddress: '',
    daoNetwork: '',
  })
  const { address } = useAppKitAccount()
  const router = useRouter()
  const toast = useToast()

  // Load assistant data like in assistant page
  useEffect(() => {
    const fetchAssistantData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_FATOU_API_URL}/api-keys/details`)
        if (!response.ok) {
          throw new Error('Failed to fetch assistant data')
        }
        const assistants = await response.json()
        setAssistantData(assistants)
      } catch (error) {
        console.error('Error validating assistant:', error)
        toast({
          title: 'Error',
          description: 'Failed to load assistant data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    fetchAssistantData()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate if slug already exists
    if (assistantData.some(assistant => assistant.slug === formData.slug)) {
      toast({
        title: 'Error',
        description: 'An assistant with this slug already exists',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (!address) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_FATOU_API_KEY || '',
        },
        body: JSON.stringify({
          walletAddress: address,
          slug: formData.slug,
          assistantName: formData.assistantName,
          introPhrase: formData.introPhrase,
          daoAddress: formData.daoAddress,
          daoNetwork: formData.daoNetwork,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create assistant')
      }

      toast({
        title: 'Success',
        description: 'Assistant created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      router.push(`/${formData.slug}`)
    } catch (error) {
      console.error('Error creating assistant:', error)
      toast({
        title: 'Error',
        description: 'Failed to create assistant',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={6}>
            Create Assistant
          </Heading>
          <Text mb={8}>
            Create your own AI assistant tailored to your organization&apos;s needs.
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel>Slug (URL identifier)</FormLabel>
              <Input
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="e.g., my-assistant"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Assistant Name</FormLabel>
              <Input
                name="assistantName"
                value={formData.assistantName}
                onChange={handleInputChange}
                placeholder="e.g., Organization Helper"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Introduction Phrase</FormLabel>
              <Input
                name="introPhrase"
                value={formData.introPhrase}
                onChange={handleInputChange}
                placeholder="Custom greeting message"
              />
            </FormControl>

            <FormControl>
              <FormLabel>DAO Address</FormLabel>
              <Input
                name="daoAddress"
                value={formData.daoAddress}
                onChange={handleInputChange}
                placeholder="Optional: Your DAO contract address"
              />
            </FormControl>

            <FormControl>
              <FormLabel>DAO Network</FormLabel>
              <Input
                name="daoNetwork"
                value={formData.daoNetwork}
                onChange={handleInputChange}
                placeholder="Optional: Network where your DAO is deployed"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isSubmitting}
              loadingText="Creating..."
            >
              Create Assistant
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}
