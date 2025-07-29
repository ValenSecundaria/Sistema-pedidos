"use client"

import React from "react"

import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  Container,
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  HStack,
  Text,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useAuth } from "../hooks/useAuth"

interface LayoutProps {
  children: React.ReactNode
  title: string
}

export function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const bg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const isMobile = useBreakpointValue({ base: true, lg: false })

  const menuItems = [
    { label: "🏠 Inicio", path: "/", color: "blue" },
    { label: "🛒 Nuevo Pedido", path: "/orders/new", color: "green", isMain: true },
    { label: "📋 Ver Pedidos", path: "/orders", color: "blue" },
    { label: "📦 Productos", path: "/products", color: "purple" },
    { label: "👥 Clientes", path: "/clients", color: "orange" },
    { label: "🧾 Pedidos por Cliente", path: "/clients/orders", color: "teal" },
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    onClose()
  }

  const handleLogout = () => {
    logout()
    onClose()
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg={bg} borderBottom="2px" borderColor={borderColor} py={4} position="sticky" top={0} zIndex={10}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <HStack spacing={4}>
              {user && isMobile && (
                <IconButton
                  aria-label="Abrir menú"
                  icon={<Text fontSize="24px">☰</Text>}
                  onClick={onOpen}
                  size="lg"
                  variant="ghost"
                  colorScheme="brand"
                />
              )}
              <Heading
                size={{ base: "md", md: "lg" }}
                color="brand.600"
                cursor="pointer"
                onClick={() => router.push("/")}
              >
                Sistema de Gestión
              </Heading>
            </HStack>

            {/* Desktop Navigation */}
            {user && !isMobile && (
              <HStack spacing={2}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={item.isMain ? "solid" : "ghost"}
                    colorScheme={item.color}
                    onClick={() => router.push(item.path)}
                    size="md"
                    fontSize="16px"
                  >
                    {item.label}
                  </Button>
                ))}
                <Button onClick={logout} colorScheme="red" size="md" ml={4}>
                  Salir
                </Button>
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>

      {/* Mobile Sidebar */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton size="lg" />
          <DrawerHeader borderBottomWidth="1px" py={6}>
            <VStack align="start" spacing={2}>
              <Heading size="lg" color="brand.600">
                Menú Principal
              </Heading>
              {user && (
                <Text fontSize="md" color="gray.600">
                  {user.email}
                </Text>
              )}
            </VStack>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {menuItems.map((item, index) => (
                <React.Fragment key={item.path}>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    onClick={() => handleNavigation(item.path)}
                    size="xl"
                    h="70px"
                    fontSize="20px"
                    fontWeight={item.isMain ? "700" : "600"}
                    colorScheme={item.color}
                    bg={item.isMain ? `${item.color}.50` : "transparent"}
                    borderRadius="0"
                    _hover={{
                      bg: `${item.color}.100`,
                    }}
                  >
                    {item.label}
                  </Button>
                  {index < menuItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}

              <Divider borderWidth="2px" />

              <Button
                variant="ghost"
                justifyContent="flex-start"
                onClick={handleLogout}
                size="xl"
                h="70px"
                fontSize="20px"
                fontWeight="600"
                colorScheme="red"
                borderRadius="0"
                _hover={{
                  bg: "red.100",
                }}
              >
                🚪 Cerrar Sesión
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Container maxW="container.xl" py={8}>
        <Heading size={{ base: "lg", md: "xl" }} mb={6} color="gray.700">
          {title}
        </Heading>
        {children}
      </Container>
    </Box>
  )
}
