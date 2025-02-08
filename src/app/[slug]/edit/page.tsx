'use client'

import {
  Container,
  Text,
  Heading,
  Box,
  Button,
  VStack,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Card,
  CardBody,
  List,
  ListItem,
  IconButton,
  Flex,
  Divider,
} from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { Upload, Trash2, RefreshCw } from 'lucide-react'
import { getAddress } from 'ethers'

interface Assistant {
  slug: string
  name: string
  introPhrase: string
  contextId: string
  daoAddress: string
  daoNetwork: string
  adminAddress: string
}

interface PageProps {
  params: {
    slug: string
  }
}

export default function EditPage({ params }: PageProps) {
  const { slug } = params
  const { address } = useAppKitAccount()
  const [assistantData, setAssistantData] = useState<Assistant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToast()

  // File management state
  const [files, setFiles] = useState<string[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)

  const isAdmin = useMemo(() => {
    if (!address || !assistantData?.adminAddress) return false
    return address.toLowerCase() === assistantData.adminAddress.toLowerCase()
  }, [address, assistantData?.adminAddress])

  // Fetch assistant data
  useEffect(() => {
    const fetchAssistantData = async () => {
      try {
        console.log('Fetching assistant data for slug:', slug)
        const response = await fetch(`${process.env.NEXT_PUBLIC_FATOU_API_URL}/api-keys/details`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Assistant data fetch error:', {
            status: response.status,
            statusText: response.statusText,
            errorBody: errorText,
          })
          throw new Error('Failed to fetch assistant data')
        }

        const assistants: Assistant[] = await response.json()
        console.log('All assistants:', assistants)

        const assistant = assistants.find(a => a.slug === slug)
        console.log('Found assistant:', assistant)

        if (!assistant) {
          notFound()
        }
        setAssistantData(assistant)
      } catch (error) {
        console.error('Error validating assistant:', error)
        toast({
          title: 'Error',
          description: 'Failed to load assistant data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssistantData()
  }, [slug, toast])

  const fetchFiles = async () => {
    if (!assistantData?.contextId || !address) {
      console.log('Missing required data:', { contextId: assistantData?.contextId, address })
      return
    }

    // Format address using ethers getAddress (previously getChecksumAddress)
    const checksummedAddress = getAddress(address)
    console.log('Making request with checksummed address:', checksummedAddress)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FATOU_API_URL}/context-files/list-files`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': checksummedAddress,
          },
          body: JSON.stringify({
            id: assistantData.contextId,
            walletAddress: checksummedAddress,
          }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          sentAddress: checksummedAddress,
        })
        throw new Error(`Failed to fetch files: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Files fetched successfully:', data)
      setFiles(data.files || [])
    } catch (error) {
      console.error('Error fetching files:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch context files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingFiles(false)
    }
  }

  useEffect(() => {
    console.log('useEffect triggered with:', {
      hasContextId: Boolean(assistantData?.contextId),
      address,
      contextId: assistantData?.contextId,
    })

    if (assistantData?.contextId && address) {
      fetchFiles()
    }
  }, [assistantData?.contextId, address])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && !file.name.toLowerCase().endsWith('.md')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload only markdown (.md) files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }
    setSelectedFile(file as any)
  }

  const handleUpload = async () => {
    if (!selectedFile || !address) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // Format address using ethers getAddress
      const checksummedAddress = getAddress(address)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FATOU_API_URL}/context-files/add-context`,
        {
          method: 'POST',
          headers: {
            'x-wallet-address': checksummedAddress,
          },
          body: formData,
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Upload error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        })
        throw new Error('Failed to upload file')
      }

      toast({
        title: 'Success',
        description: 'File uploaded successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      setSelectedFile(null)
      fetchFiles() // Refresh the file list
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (filename: string) => {
    if (!address) return

    try {
      // Format address using ethers getAddress
      const checksummedAddress = getAddress(address)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FATOU_API_URL}/context-files/delete-context`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': checksummedAddress,
          },
          body: JSON.stringify({ filename }),
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Delete error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
        })
        throw new Error('Failed to delete file')
      }

      toast({
        title: 'Success',
        description: 'File deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })

      fetchFiles() // Refresh the file list
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (isLoading || !address) {
    return (
      <Container maxW="container.sm" py={20}>
        <Text>{isLoading ? 'Loading...' : 'Please connect your wallet'}</Text>
      </Container>
    )
  }

  if (!assistantData) {
    return notFound()
  }

  if (!isAdmin) {
    return (
      <Container maxW="container.sm" py={20}>
        <Text>You don&apos;t have permission to edit this assistant.</Text>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={20}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={6}>
            Edit {assistantData.name || slug}
          </Heading>
          <Text mb={4}>Manage your assistant&apos;s context files and settings.</Text>
        </Box>

        <VStack spacing={8} align="stretch">
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md" mb={2}>
                  Upload Context Files
                </Heading>
                <FormControl>
                  <FormLabel>Select Markdown File</FormLabel>
                  <Input type="file" accept=".md" onChange={handleFileChange} mb={4} />
                </FormControl>
                <Button
                  leftIcon={<Upload size={16} />}
                  colorScheme="blue"
                  onClick={handleUpload}
                  isLoading={isUploading}
                  isDisabled={!selectedFile}
                >
                  Upload File
                </Button>
              </VStack>
            </CardBody>
          </Card>

          <Divider />

          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading size="md">Context Files</Heading>
                  <IconButton
                    icon={<RefreshCw size={16} />}
                    onClick={fetchFiles}
                    isLoading={isLoadingFiles}
                    aria-label="Refresh files"
                    size="sm"
                  />
                </Flex>

                {isLoadingFiles ? (
                  <Text>Loading files...</Text>
                ) : files.length === 0 ? (
                  <Text color="gray.500">No context files uploaded yet.</Text>
                ) : (
                  <List spacing={2}>
                    {files.map(filename => (
                      <ListItem key={filename}>
                        <Flex justify="space-between" align="center">
                          <Text>{filename}</Text>
                          <IconButton
                            icon={<Trash2 size={16} />}
                            onClick={() => handleDelete(filename)}
                            colorScheme="red"
                            variant="ghost"
                            size="sm"
                            aria-label="Delete file"
                          />
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                )}
              </VStack>
            </CardBody>
          </Card>
        </VStack>

        <Box pt={4}>
          <Link href={`/${slug}`}>
            <Button variant="outline">Back to Assistant</Button>
          </Link>
        </Box>
      </VStack>
    </Container>
  )
}
