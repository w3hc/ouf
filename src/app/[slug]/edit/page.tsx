'use client'

import { Container, Text, Heading, Box, Button, Flex } from '@chakra-ui/react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import pages from '../../../../pages.json'

interface PageProps {
  params: {
    slug: string
  }
}

export default function AssistantPage({ params }: PageProps) {
  const { slug } = params

  if (!pages.includes(slug)) {
    notFound()
  }

  return (
    <Container maxW="container.sm" py={20}>
      <Box>
        <Heading as="h1" size="xl" mb={6}>
          {slug} dashboard
        </Heading>
        <Text>
          Here you can edit <strong>{slug}</strong>
        </Text>
      </Box>
    </Container>
  )
}
