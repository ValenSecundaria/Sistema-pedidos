"use client"

import { VStack, Text, Button, Card, CardBody, Heading, Box, HStack, Badge, useBreakpointValue } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/layout"

export default function HomePage() {
  const router = useRouter()
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <ProtectedRoute>
      <Layout title="Panel Principal">
        <VStack spacing={{ base: 6, md: 10 }} align="stretch">
          {/* Acción Principal - Crear Pedido */} 
          <Card bg="green.50" borderColor="green.200" borderWidth="2px" boxShadow="lg">
            <CardBody p={{ base: 4, md: 8 }} textAlign="center">
              <VStack spacing={{ base: 4, md: 6 }}>
                <Box>
                  <Text fontSize={{ base: "48px", md: "60px" }} mb={2}>
                    🛒
                  </Text>
                  <Heading size={{ base: "lg", md: "xl" }} color="green.700" mb={4}>
                    Crear Nuevo Pedido
                  </Heading>
                  <Text
                    fontSize={{ base: "md", md: "xl" }}
                    color="green.600"
                    maxW="500px"
                    mx="auto"
                    px={{ base: 2, md: 0 }}
                  >
                    Comience a crear un pedido para sus clientes. Esta es la función principal del sistema.
                  </Text>
                </Box>

                <Button
                  size="xl"
                  colorScheme="green"
                  onClick={() => router.push("/orders/new")}
                  w="full"
                  maxW={{ base: "100%", md: "400px" }}
                  h={{ base: "70px", md: "90px" }}
                  fontSize={{ base: "20px", md: "26px" }}
                  fontWeight="700"
                  boxShadow="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                  }}
                >
                  ➕ CREAR PEDIDO AHORA
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Acciones Secundarias */}
          <Box>
            <Heading size={{ base: "md", md: "lg" }} mb={{ base: 4, md: 6 }} textAlign="center" color="gray.700">
              Acciones Rápidas
            </Heading>

            <VStack spacing={4} maxW="700px" mx="auto">
              {/* Ver Pedidos del Día */}
              <Card w="full" _hover={{ transform: "translateY(-1px)", boxShadow: "md" }} boxShadow="sm">
                <CardBody p={{ base: 4, md: 6 }}>
                  {isMobile ? (
                    // Layout móvil: Vertical
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} justify="center">
                        <Text fontSize="36px">📋</Text>
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Heading size="md">Pedidos del Día</Heading>
                            <Badge colorScheme="blue" fontSize="xs">
                              Importante
                            </Badge>
                          </HStack>
                          <Text color="gray.600" fontSize="md">
                            Ver y gestionar pedidos realizados hoy
                          </Text>
                        </VStack>
                      </HStack>
                      <Button
                        colorScheme="blue"
                        onClick={() => router.push("/orders")}
                        size="lg"
                        w="full"
                        h="60px"
                        fontSize="18px"
                      >
                        📋 Ver Pedidos del Día
                      </Button>
                    </VStack>
                  ) : (
                    // Layout desktop: Horizontal
                    <HStack spacing={4} align="center">
                      <Text fontSize="40px">📋</Text>
                      <VStack align="start" flex={1} spacing={1}>
                        <HStack>
                          <Heading size="md">Pedidos del Día</Heading>
                          <Badge colorScheme="blue" fontSize="sm">
                            Importante
                          </Badge>
                        </HStack>
                        <Text color="gray.600" fontSize="lg">
                          Ver y gestionar pedidos realizados hoy
                        </Text>
                      </VStack>
                      <Button colorScheme="blue" onClick={() => router.push("/orders")} size="lg" minW="140px" h="50px">
                        Ver Pedidos
                      </Button>
                    </HStack>
                  )}
                </CardBody>
              </Card>

              {/* Gestión de Productos */}
              <Card w="full" _hover={{ transform: "translateY(-1px)", boxShadow: "md" }} boxShadow="sm">
                <CardBody p={{ base: 4, md: 6 }}>
                  {isMobile ? (
                    // Layout móvil: Vertical
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} justify="center">
                        <Text fontSize="36px">📦</Text>
                        <VStack align="start" spacing={1}>
                          <Heading size="md">Productos</Heading>
                          <Text color="gray.600" fontSize="md">
                            Administrar catálogo de productos
                          </Text>
                        </VStack>
                      </HStack>
                      <Button
                        colorScheme="purple"
                        onClick={() => router.push("/products")}
                        size="lg"
                        w="full"
                        h="60px"
                        fontSize="18px"
                      >
                        📦 Gestionar Productos
                      </Button>
                    </VStack>
                  ) : (
                    // Layout desktop: Horizontal
                    <HStack spacing={4} align="center">
                      <Text fontSize="40px">📦</Text>
                      <VStack align="start" flex={1} spacing={1}>
                        <Heading size="md">Productos</Heading>
                        <Text color="gray.600" fontSize="lg">
                          Administrar catálogo de productos
                        </Text>
                      </VStack>
                      <Button
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => router.push("/products")}
                        size="lg"
                        minW="140px"
                        h="50px"
                      >
                        Gestionar
                      </Button>
                    </HStack>
                  )}
                </CardBody>
              </Card>

              {/* Gestión de Clientes */}
              <Card w="full" _hover={{ transform: "translateY(-1px)", boxShadow: "md" }} boxShadow="sm">
                <CardBody p={{ base: 4, md: 6 }}>
                  {isMobile ? (
                    // Layout móvil: Vertical
                    <VStack spacing={4} align="stretch">
                      <HStack spacing={3} justify="center">
                        <Text fontSize="36px">👥</Text>
                        <VStack align="start" spacing={1}>
                          <Heading size="md">Clientes</Heading>
                          <Text color="gray.600" fontSize="md">
                            Administrar base de clientes
                          </Text>
                        </VStack>
                      </HStack>
                      <Button
                        colorScheme="orange"
                        onClick={() => router.push("/clients")}
                        size="lg"
                        w="full"
                        h="60px"
                        fontSize="18px"
                      >
                        👥 Gestionar Clientes
                      </Button>
                    </VStack>
                  ) : (
                    // Layout desktop: Horizontal
                    <HStack spacing={4} align="center">
                      <Text fontSize="40px">👥</Text>
                      <VStack align="start" flex={1} spacing={1}>
                        <Heading size="md">Clientes</Heading>
                        <Text color="gray.600" fontSize="lg">
                          Administrar base de clientes
                        </Text>
                      </VStack>
                      <Button
                        colorScheme="orange"
                        variant="outline"
                        onClick={() => router.push("/clients")}
                        size="lg"
                        minW="140px"
                        h="50px"
                      >
                        Gestionar
                      </Button>
                    </HStack>
                  )}
                </CardBody>
              </Card>
            </VStack>
          </Box>

          {/* Acceso Rápido Adicional - Solo Móvil */}
          {isMobile && (
            <Card bg="blue.50" borderColor="blue.200" borderWidth="1px">
              <CardBody p={4}>
                <VStack spacing={4}>
                  <Text fontSize="32px">⚡</Text>
                  <Heading size="md" color="blue.700" textAlign="center">
                    Acceso Rápido
                  </Heading>
                  <VStack spacing={3} w="full">
                    <Button
                      colorScheme="green"
                      onClick={() => router.push("/orders/new")}
                      size="lg"
                      w="full"
                      h="55px"
                      fontSize="16px"
                    >
                      🛒 Nuevo Pedido
                    </Button>
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => router.push("/orders")}
                      size="lg"
                      w="full"
                      h="55px"
                      fontSize="16px"
                    >
                      📋 Ver Pedidos
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* Información del Sistema */}
          <Card bg="gray.50" borderColor="gray.200" borderWidth="1px">
            <CardBody p={{ base: 4, md: 6 }} textAlign="center">
              <VStack spacing={3}>
                <Text fontSize={{ base: "28px", md: "32px" }}>ℹ️</Text>
                <Heading size={{ base: "sm", md: "md" }} color="gray.700">
                  Sistema de Gestión Comercial
                </Heading>
                <Text color="gray.600" fontSize={{ base: "md", md: "lg" }} px={{ base: 2, md: 0 }}>
                  Gestione sus pedidos, productos y clientes de manera simple y eficiente
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
