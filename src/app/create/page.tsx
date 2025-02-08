'use client'

import {
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Text,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from '@reown/appkit/react'
import { getAddress } from 'ethers'

interface CreateAssistantData {
  walletAddress?: string
  slug?: string
  assistantName?: string
  introPhrase?: string
  daoAddress?: string
  daoNetwork?: string
}

export default function CreatePage() {
  const router = useRouter()
  const toast = useToast()
  const { address } = useAppKitAccount()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateAssistantData>({
    slug: '',
    assistantName: '',
    introPhrase: '',
    daoAddress: '',
    daoNetwork: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    setIsLoading(true)
    try {
      // Format the wallet address using ethers
      const checksummedAddress = getAddress(address)

      // Log the request details for debugging
      const requestBody = {
        walletAddress: checksummedAddress,
        ...formData,
      }
      console.log('Sending request with:', {
        body: requestBody,
        masterKey: process.env.NEXT_PUBLIC_MASTER_KEY,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_FATOU_API_URL}/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_MASTER_KEY!,
        },
        body: JSON.stringify(requestBody),
      })

      const responseText = await response.text()
      console.log('Raw response:', responseText)

      if (!response.ok) {
        console.error('Create assistant error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: responseText,
          sentData: {
            address: checksummedAddress,
            formData,
          },
        })
        throw new Error('Failed to create assistant')
      }

      const data = JSON.parse(responseText)
      console.log('Assistant created successfully:', data)

      toast({
        title: 'Success',
        description: 'Assistant created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      // Redirect to the new assistant's page
      router.push(`/${formData.slug}/edit`)
    } catch (error) {
      console.error('Error creating assistant:', error)
      toast({
        title: 'Error',
        description: 'Failed to create assistant. Please check the console for details.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Optional: validate DAO address if provided
  const handleDaoAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    try {
      // Only format if there's a value
      const formattedAddress = value ? getAddress(value) : value
      setFormData(prev => ({
        ...prev,
        daoAddress: formattedAddress,
      }))
    } catch (error) {
      // If invalid address, store as is (validation will be handled on submit)
      setFormData(prev => ({
        ...prev,
        daoAddress: value,
      }))
    }
  }

  if (!address) {
    return (
      <Container maxW="container.sm" py={20}>
        <Text>Please connect your wallet to create an assistant.</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.sm" py={20}>
      <VStack spacing={8} as="form" onSubmit={handleSubmit}>
        <Heading>Create New Assistant</Heading>

        <FormControl isRequired>
          <FormLabel>Slug</FormLabel>
          <Input
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="unique-assistant-name"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Assistant Name</FormLabel>
          <Input
            name="assistantName"
            value={formData.assistantName}
            onChange={handleInputChange}
            placeholder="My Assistant"
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Introduction Phrase</FormLabel>
          <Input
            name="introPhrase"
            value={formData.introPhrase}
            onChange={handleInputChange}
            placeholder="Hello! I'm here to help..."
          />
        </FormControl>

        <FormControl>
          <FormLabel>DAO Address (optional)</FormLabel>
          <Input
            name="daoAddress"
            value={formData.daoAddress}
            onChange={handleDaoAddressChange}
            placeholder="0x..."
          />
        </FormControl>

        <FormControl>
          <FormLabel>DAO Network (optional)</FormLabel>
          <Input
            name="daoNetwork"
            value={formData.daoNetwork}
            onChange={handleInputChange}
            placeholder="e.g., 'base'"
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isLoading} width="full">
          Create Assistant
        </Button>
      </VStack>
    </Container>
  )
}
