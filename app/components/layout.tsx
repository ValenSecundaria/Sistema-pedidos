"use client"

import type React from "react"

import { Box, Flex, Heading, Button, Stack, Container, useColorModeValue } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const bg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg={bg} borderBottom="1px" borderColor={borderColor} py={4}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading size="lg" color="brand.700">
              Sistema de Gestión
            </Heading>
            {user && (
              <Stack direction="row" spacing={4} align="center">
                <Button variant="ghost" onClick={() => router.push("/")} size="md">
                  Inicio
                </Button>
                <Button variant="ghost" onClick={() => router.push("/products")} size="md">
                  Productos
                </Button>
                <Button variant="ghost" onClick={() => router.push("/clients")} size="md">
                  Clientes
                </Button>
                <Button variant="ghost" onClick={() => router.push("/orders")} size="md">
                  Pedidos
                </Button>
                <Button onClick={logout} colorScheme="red" size="md">
                  Salir
                </Button>
              </Stack>
            )}
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Heading size="xl" mb={6} color="gray.700">
          {title}
        </Heading>
        {children}
      </Container>
    </Box>
  )
}
