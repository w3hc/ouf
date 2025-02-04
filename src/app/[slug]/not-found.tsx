'use client'

import { Container, Text, Heading, Button } from '@chakra-ui/react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <Container maxW="container.sm" py={20}>
      <Heading as="h2" size="xl" mb={6}>
        Assistant Not Found
      </Heading>
      <Text mb={6}>Sorry, the assistant you&apos;re looking for doesn&apos;t exist.</Text>
      <Link href="/">
        <Button
          bg="#8c1c84"
          color="white"
          _hover={{
            bg: '#6d1566',
          }}
        >
          Return Home
        </Button>
      </Link>
    </Container>
  )
}
