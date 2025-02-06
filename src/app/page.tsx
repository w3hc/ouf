'use client'

import {
  Container,
  Text,
  useToast,
  Button,
  Tooltip,
  SimpleGrid,
  Box,
  Heading,
  VStack,
  Spinner,
} from '@chakra-ui/react'
import { useAppKitAccount, useAppKitNetwork, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, parseEther, formatEther } from 'ethers'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'

interface Assistant {
  slug: string
  name: string
  introPhrase: string
  contextId: string
  daoAddress: string
  daoNetwork: string
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [txLink, setTxLink] = useState<string>()
  const [txHash, setTxHash] = useState<string>()
  const [balance, setBalance] = useState<string>('0')
  const [assistants, setAssistants] = useState<Assistant[]>([])
  const [isLoadingAssistants, setIsLoadingAssistants] = useState(true)

  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const toast = useToast()

  useEffect(() => {
    const fetchAssistants = async () => {
      try {
        const response = await fetch('/api/assistants')
        if (!response.ok) {
          throw new Error('Failed to fetch assistants')
        }
        const data = await response.json()
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
  }, [toast])

  useEffect(() => {
    const checkBalance = async () => {
      if (address && walletProvider) {
        try {
          const provider = new BrowserProvider(walletProvider as any)
          const balance = await provider.getBalance(address)
          setBalance(formatEther(balance))
        } catch (error) {
          console.error('Error fetching balance:', error)
        }
      }
    }

    checkBalance()
  }, [address, walletProvider])

  const handleSend = async () => {
    setTxHash('')
    setTxLink('')
    if (!address || !walletProvider) {
      toast({
        title: 'Not connected',
        description: 'Please connect your wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      const provider = new BrowserProvider(walletProvider as any)
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: address,
        value: parseEther('0.0001'),
      })

      const receipt = await tx.wait(1)

      setTxHash(receipt?.hash)
      setTxLink('https://sepolia.etherscan.io/tx/' + receipt?.hash)

      toast({
        title: 'Transaction successful',
        description: `Sent 0.0001 ETH to ${address}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Transaction failed:', error)
      toast({
        title: 'Transaction failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const hasEnoughBalance = Number(balance) >= 0.0001

  return (
    <Container maxW="container.lg" py={20}>
      <VStack spacing={12} align="stretch">
        {/* Assistants Grid */}
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
                <Link key={assistant.slug} href={`/${assistant.slug}`}>
                  <Box
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
                    cursor="pointer"
                  >
                    <VStack spacing={4} align="stretch">
                      <Heading size="md" color="white" textTransform="capitalize">
                        {assistant.name || assistant.slug.replace(/-/g, ' ')}
                      </Heading>
                      {/* <Text color="gray.400">
                        {assistant.introPhrase ||
                          `Chat with ${assistant.name || assistant.slug.replace(/-/g, ' ')}`}
                      </Text> */}
                      {/* {assistant.daoNetwork && (
                        <Text color="gray.500" fontSize="sm">
                          Network: {assistant.daoNetwork}
                        </Text>
                      )} */}
                      <Button
                        leftIcon={<MessageCircle size={20} />}
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        width="fit-content"
                      >
                        Start Chat
                      </Button>
                    </VStack>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          )}
        </Box>
        {/* Wallet Section */}
        {/* <Box>
          {isConnected && (
            <>
              <Heading as="h2" size="md" mb={6}>
                Test Transaction
              </Heading>
              <VStack align="stretch" spacing={4}>
                <Tooltip
                  label={
                    !hasEnoughBalance ? 'Please connect with an account that has a bit of ETH' : ''
                  }
                  isDisabled={hasEnoughBalance}
                  hasArrow
                  bg="black"
                  color="white"
                  borderWidth="1px"
                  borderColor="red.500"
                  borderRadius="md"
                  p={2}
                >
                  <Button
                    onClick={handleSend}
                    isLoading={isLoading}
                    loadingText="Sending..."
                    bg="#45a2f8"
                    color="white"
                    _hover={{
                      bg: '#3182ce',
                    }}
                    isDisabled={!hasEnoughBalance}
                  >
                    Send 0.0001 ETH to self
                  </Button>
                </Tooltip>
                {txHash && (
                  <Text fontSize="14px" color="#45a2f8">
                    <Link href={txLink || ''} target="_blank" rel="noopener noreferrer">
                      {txHash}
                    </Link>
                  </Text>
                )}
              </VStack>
            </>
          )}
        </Box> */}
      </VStack>
    </Container>
  )
}
