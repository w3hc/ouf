'use client'

import { Container, Text, Heading, Box, Button, Flex } from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import pages from '../../../pages.json'

interface PageProps {
  params: {
    slug: string
  }
}

export default function AssistantPage({ params }: PageProps) {
  const { slug } = params

  // Check if the slug exists in pages.json
  if (!pages.includes(slug)) {
    notFound()
  }

  return (
    <Container maxW="container.sm" py={20}>
      <Flex
        position="fixed"
        top="80px" // Added 80px to account for the header height
        right={4}
        zIndex={10}
      >
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
      <Box>
        <Heading as="h1" size="xl" mb={6}>
          {slug}
        </Heading>
        <Text>This is the assistant page for {slug}</Text>
      </Box>
    </Container>
  )
}
