'use client'

import {
  Box,
  Button,
  Flex,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { useAppKit } from '@reown/appkit/react'
import { useAppKitAccount, useDisconnect } from '@reown/appkit/react'
import Link from 'next/link'
import { HamburgerIcon } from '@chakra-ui/icons'
import { usePathname } from 'next/navigation'

export default function Header() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()
  const pathname = usePathname()

  const handleConnect = () => {
    try {
      open({ view: 'Connect' })
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const handleDisconnect = () => {
    try {
      disconnect()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  // Check if we're on an assistant page and if it's the edit view
  const assistantMatch = pathname.match(/^\/([^\/]+)(\/edit)?$/)
  const currentAssistant = assistantMatch?.[1]
  const isEditPage = pathname.endsWith('/edit')

  return (
    <Box as="header" py={4} position="fixed" w="100%" top={0} zIndex={10}>
      <Flex justify="space-between" align="center" px={4}>
        <Link href="/">
          <Heading as="h3" size="md" textAlign="center">
            Ouf
          </Heading>
        </Link>
        <Flex gap={2} align="center">
          {!isConnected ? (
            <Button
              bg="#8c1c84"
              color="white"
              _hover={{
                bg: '#6d1566',
              }}
              onClick={handleConnect}
              size="sm"
            >
              Login
            </Button>
          ) : (
            <>
              <Box transform="scale(0.85)" transformOrigin="right center">
                <appkit-network-button />
              </Box>
              <Button
                bg="#8c1c84"
                color="white"
                _hover={{
                  bg: '#6d1566',
                }}
                onClick={handleDisconnect}
                size="sm"
                ml={4}
              >
                Logout
              </Button>
            </>
          )}
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<HamburgerIcon />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <Link href="/francesca">
                <MenuItem fontSize="md">Francesca</MenuItem>
              </Link>
              <Link href="/create">
                <MenuItem fontSize="md">Create yours!</MenuItem>
              </Link>
              {currentAssistant && (
                <Link href={isEditPage ? `/${currentAssistant}` : `/${currentAssistant}/edit`}>
                  <MenuItem
                    fontSize="md"
                    color={isEditPage ? 'blue.500' : 'red.500'}
                    _hover={{
                      bg: isEditPage ? 'blue.50' : 'red.50',
                      color: isEditPage ? 'blue.600' : 'red.600',
                    }}
                  >
                    {isEditPage ? 'View Assistant' : 'Edit Assistant'}
                  </MenuItem>
                </Link>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  )
}
