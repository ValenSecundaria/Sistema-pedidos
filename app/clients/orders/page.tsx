"use client"

import { useState, useEffect } from "react"
import {
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  useBreakpointValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Divider,
  Flex,
  useToast,
} from "@chakra-ui/react"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import { Layout } from "@/app/components/layout"

import type {
  Client,
  OrderItem as BaseOrderItem,
  Order as BaseOrder
} from "../../types"

// Si necesitás mostrar `productName`, `unitPrice`, etc., podés extender así:
export interface OrderItem extends BaseOrderItem {
  id: string // si este ID es del item, no del producto
  productName: string
  unitPrice: number
  subtotal: number
  saleType?: "lista1" | "lista2"
}

export interface Order extends BaseOrder {
  orderNumber: string
  items: OrderItem[] // Usamos el extendido de arriba
  status: "pending" | "completed" | "cancelled"
}


export default function ClientOrdersPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)
  const [error, setError] = useState<string>("")

  const isMobile = useBreakpointValue({ base: true, md: false })
  const toast = useToast()

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClients()
  }, [])

  // Cargar pedidos cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find((c) => c.id === selectedClientId)
      setSelectedClient(client || null)
      loadClientOrders(selectedClientId)
    } else {
      setSelectedClient(null)
      setOrders([])
    }
  }, [selectedClientId, clients])

  const loadClients = async () => {
    try {
      setLoadingClients(true)
      setError("")

      const response = await fetch("/api/clients-frecuent")

      if (!response.ok) {
        throw new Error("Error al cargar clientes")
      }

      const clientsRes = await response.json()
      console.log("Clientes recibidos:", clientsRes)

      setClients(clientsRes.clients || [])
    } catch (error) {
      console.error("Error cargando clientes:", error)
      setError("No se pudieron cargar los clientes")

      // Datos mock para desarrollo
      const mockClients = [
        {
          id: "1",
          name: "Juan Pérez",
          type: "normal" as const,
          phone: "3001234567",
          address: "Calle 123 #45-67",
          name_business: "Tienda Juan",
          neighborhood: "Centro",
        },
        {
          id: "2",
          name: "María García",
          type: "premium" as const,
          phone: "3009876543",
          address: "Carrera 45 #12-34",
          name_business: "Supermercado María",
          neighborhood: "Norte",
        },
      ]
      setClients(mockClients)

      toast({
        title: "Usando datos de prueba",
        description: "No se pudo conectar con la API, mostrando datos de ejemplo",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      })
    } finally {
      setLoadingClients(false)
    }
  }

  const loadClientOrders = async (clientId: string) => {
    try {
      setLoading(true)
      setError("")

      // Llamada a la API para obtener pedidos del cliente
      const response = await fetch(`/api/clients/${clientId}`)

      if (!response.ok) {
        throw new Error("Error al cargar pedidos")
      }

      const ordersRes = await response.json()
      console.log("Pedidos recibidos:", ordersRes)

      setOrders(ordersRes.orders || [])
    } catch (error) {
      console.error("Error cargando pedidos:", error)
      setError("No se pudieron cargar los pedidos del cliente")

    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green"
      case "pending":
        return "yellow"
      case "cancelled":
        return "red"
      default:
        return "gray"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "Listo":
        return "Completado"
      case "Pendiente":
        return "Pendiente"
      case "Cancelado":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  return (
    <ProtectedRoute>
      <Layout title="Pedidos por Cliente">
        <VStack spacing={6} align="stretch">
          {/* Selector de Cliente */}
          <Card borderWidth="2px" borderColor="blue.200">
            <CardHeader bg="blue.50">
              <Heading size="lg" color="blue.700" textAlign="center">
                👤 Seleccionar Cliente
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                {loadingClients ? (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Spinner size="lg" color="blue.500" />
                      <Text fontSize="lg">Cargando clientes...</Text>
                    </VStack>
                  </Center>
                ) : error && clients.length === 0 ? (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="600">Error al cargar clientes</Text>
                      <Text fontSize="sm">{error}</Text>
                    </VStack>
                  </Alert>
                ) : (
                  <>
                    <Select
                      placeholder="Seleccione un cliente..."
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      size="lg"
                      fontSize="md"
                      bg="white"
                    >
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} {client.name_business ? `(${client.name_business})` : ""} -{" "}
                          {client.type === "premium" ? "PREMIUM" : "NORMAL"}
                        </option>
                      ))}
                    </Select>

                    {selectedClient && (
                      <Card w="full" bg="gray.50" borderWidth="1px">
                        <CardBody p={4}>
                          <VStack align="start" spacing={2}>
                            <HStack justify="space-between" w="full">
                              <Heading size="md" color="blue.600">
                                {selectedClient.name}
                              </Heading>
                              <Badge
                                colorScheme={selectedClient.type === "premium" ? "blue" : "gray"}
                                fontSize="sm"
                                px={2}
                                py={1}
                              >
                                {selectedClient.type === "premium" ? "PREMIUM" : "NORMAL"}
                              </Badge>
                            </HStack>
                            {selectedClient.phone && <Text fontSize="md">📱 {selectedClient.phone}</Text>}
                            {selectedClient.address && <Text fontSize="md">📍 {selectedClient.address}</Text>}
                            {selectedClient.name_business && (
                              <Text fontSize="md">🏪 {selectedClient.name_business}</Text>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    )}

                    <Button
                      colorScheme="blue"
                      variant="outline"
                      onClick={loadClients}
                      size="md"
                      leftIcon={<Text fontSize="16px">🔄</Text>}
                    >
                      Actualizar Lista
                    </Button>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Lista de Pedidos */}
          {selectedClientId && (
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
                  <Heading size="lg" color="gray.700">
                    📋 Pedidos del Cliente
                  </Heading>
                  {orders.length > 0 && (
                    <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                      {orders.length} pedido(s)
                    </Badge>
                  )}
                </Flex>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <Center py={12}>
                    <VStack spacing={3}>
                      <Spinner size="xl" color="blue.500" />
                      <Text fontSize="lg">Cargando pedidos...</Text>
                    </VStack>
                  </Center>
                ) : orders.length === 0 ? (
                  <Center py={12}>
                    <VStack spacing={4}>
                      <Text fontSize="60px">📋</Text>
                      <Heading size="md" color="gray.500">
                        No hay pedidos registrados
                      </Heading>
                      <Text fontSize="lg" color="gray.400" textAlign="center">
                        Este cliente aún no tiene pedidos asociados
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <>
                    {isMobile ? (
                      // Vista móvil: Cards
                      <VStack spacing={4}>
                        {orders.map((order) => (
                          <Card key={order.id} w="full" borderWidth="1px">
                            <CardBody>
                              <VStack align="stretch" spacing={4}>
                                {/* Header del pedido */}
                                <Flex justify="space-between" align="start">
                                  <VStack align="start" spacing={1}>
                                    <Heading size="md" color="blue.600">
                                      {order.orderNumber}
                                    </Heading>
                                    <Text fontSize="sm" color="gray.500">
                                      {formatDate(order.dateCreated)}
                                    </Text>
                                  </VStack>
                                  <Badge colorScheme={getStatusColor(order.status)} fontSize="sm" px={2} py={1}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                </Flex>

                                <Divider />

                                {/* Items del pedido */}
                                <VStack align="stretch" spacing={2}>
                                  <Text fontSize="md" fontWeight="600" color="gray.700">
                                    Productos:
                                  </Text>
                                  {order.items.map((item) => (
                                    <HStack key={item.id} justify="space-between" p={2} bg="gray.50" borderRadius="md">
                                      <VStack align="start" spacing={0} flex={1}>
                                        <Text fontSize="md" fontWeight="600">
                                          {item.productName}
                                        </Text>
                                        <Text fontSize="sm" color="gray.600">
                                          Cantidad: {item.quantity} × ${item.unitPrice}
                                        </Text>
                                      </VStack>
                                      <Text fontSize="md" fontWeight="700" color="green.600">
                                        ${item.subtotal}
                                      </Text>
                                    </HStack>
                                  ))}
                                </VStack>

                                <Divider />

                                {/* Total */}
                                <HStack justify="space-between">
                                  <Text fontSize="lg" fontWeight="700">
                                    Total:
                                  </Text>
                                  <Text fontSize="xl" fontWeight="700" color="green.600">
                                    ${order.total}
                                  </Text>
                                </HStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    ) : (
                      // Vista desktop: Tabla
                      <TableContainer>
                        <Table variant="simple">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th>Número</Th>
                              <Th>Fecha</Th>
                              <Th>Items</Th>
                              <Th isNumeric>Total</Th>
                              <Th>Estado</Th>
                              <Th>Acciones</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {orders.map((order) => (
                              <Tr key={order.id}>
                                <Td fontWeight="600" color="blue.600">
                                  {order.orderNumber}
                                </Td>
                                <Td>{formatDate(order.dateCreated)}</Td>
                                <Td>
                                  <VStack align="start" spacing={1}>
                                    {order.items.map((item) => (
                                      <Text key={item.id} fontSize="sm">
                                        {item.productName} (x{item.quantity})
                                      </Text>
                                    ))}
                                  </VStack>
                                </Td>
                                <Td isNumeric fontWeight="700" color="green.600">
                                  ${order.total}
                                </Td>
                                <Td>
                                  <Badge colorScheme={getStatusColor(order.status)} fontSize="sm" px={2} py={1}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                </Td>
                                <Td>
                                  <Button
                                    size="sm"
                                    colorScheme="blue"
                                    variant="outline"
                                    onClick={() => window.open(`/orders/${order.id}/print`, "_blank")}
                                  >
                                    Ver Detalle
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}
              </CardBody>
            </Card>
          )}
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
