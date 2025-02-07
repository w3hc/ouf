'use client'

import {
  Container,
  Text,
  useToast,
  Button,
  SimpleGrid,
  Box,
  Heading,
  VStack,
  Flex,
} from '@chakra-ui/react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Settings } from 'lucide-react'
import Image from 'next/image'

interface Assistant {
  slug: string
  name: string
  introPhrase: string
  contextId: string
  daoAddress: string
  daoNetwork: string
  adminAddress: string
}

export default function Home() {
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true)
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const { address, isConnected } = useAppKitAccount()
  const toast = useToast()

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('/api/assistants')
        if (!response.ok) {
          throw new Error('Failed to fetch assistants')
        }
        const data = await response.json()
        console.log('Raw API Response:', data)
        console.log('Current wallet address:', address)
        setAssistants(data)
      } catch (error) {
        console.error('Error fetching assistants:', error)
        toast({
          title: 'Error',
          description: 'Failed to load assistants',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoadingAssistants(false)
      }
    }

    fetchAssistants()
  }, [address, toast])

  const isAdmin = (assistant: Assistant) => {
    const result = address?.toLowerCase() === assistant.adminAddress?.toLowerCase()
    console.log('Admin check for:', assistant.name, {
      isMatch: result,
      userAddress: address?.toLowerCase(),
      adminAddress: assistant.adminAddress?.toLowerCase(),
    })
    return result
  }

  return (
    <Container maxW="container.lg" py={20}>
      <VStack spacing={12} align="stretch">
        <Box>
          <Heading as="h2" size="md" mb={6}>
            Available Assistants
          </Heading>
          {isLoadingAssistants ? (
            <Box textAlign="center" py={10}>
              <Image priority width="120" height="120" alt="loader" src="/loader.svg" />
            </Box>
          ) : assistants.length === 0 ? (
            <Text color="gray.400">No assistants available</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {assistants.map(assistant => (
                <Box
                  key={assistant.slug}
                  p={6}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.700"
                  bg="gray.900"
                  _hover={{
                    borderColor: 'blue.500',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  }}
                >
                  <VStack spacing={4} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="md" color="white" textTransform="capitalize">
                        {assistant.name || assistant.slug.replace(/-/g, ' ')}
                      </Heading>
                      {isAdmin(assistant) && (
                        <Link href={`/${assistant.slug}/edit`}>
                          <Button
                            leftIcon={<Settings size={16} />}
                            variant="ghost"
                            colorScheme="purple"
                            size="sm"
                            p={2}
                          >
                            Edit
                          </Button>
                        </Link>
                      )}
                    </Flex>

                    <Link href={`/${assistant.slug}`}>
                      <Button
                        leftIcon={<MessageCircle size={20} />}
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        width="fit-content"
                      >
                        Start Chat
                      </Button>
                    </Link>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  )
}
