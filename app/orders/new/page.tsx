"use client"

import { useState, useEffect } from "react"
import {
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Divider,
  RadioGroup,
  Radio,
  Stack,
} from "@chakra-ui/react"
import { useRouter } from "next/navigation"

import { Layout } from "@/app/components/layout"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import { Client, Order, OrderItem, Product } from "@/app/types"

export default function NewOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedClient, setSelectedClient] = useState("")
  const [newClientData, setNewClientData] = useState({
    name: "",
    type: "normal" as Client["type"],
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentItem, setCurrentItem] = useState({
    productId: "",
    quantity: 1,
    saleType: "lista1" as OrderItem["saleType"],
  })

  // Productos (mock)
  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Producto A",
      description: "Descripción A",
      category: "carpeta1",
      priceNormal: 100,
      pricePremium: 120,
      saleType: "lista1",
    },
    {
      id: "2",
      name: "Producto B",
      description: "Descripción B",
      category: "carpeta2",
      priceNormal: 200,
      pricePremium: 240,
      saleType: "lista2",
    },
  ])

  // Clientes desde API
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => {
        if (!res.ok) throw new Error("Error al cargar clientes")
        return res.json()
      })
      .then((data: { id: string; nombre_completo: string; tipo: string }[]) => {
        // Ajustamos al tipo Client
        const loaded = data.map((c) => ({
          id: c.id,
          name: c.nombre_completo,
          type: c.tipo as Client["type"],
        }))
        setClients(loaded)
      })
      .catch((err) => {
        console.error(err)
        setClientsError(err.message)
      })
      .finally(() => {
        setLoadingClients(false)
      })
  }, [])

  const addItem = () => {
    if (currentItem.productId) {
      setOrderItems([...orderItems, { ...currentItem }])
      setCurrentItem({
        productId: "",
        quantity: 1,
        saleType: "lista1",
      })
    }
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return total

      const client = clients.find((c) => c.id === selectedClient)
      const price =
        client?.type === "Premium" ? product.pricePremium : product.priceNormal

      return total + price * item.quantity
    }, 0)
  }

  const saveOrder = async () => {
    const order: Order = {
      id: Date.now().toString(),
      clientId: selectedClient,
      items: orderItems,
      dateCreated: new Date().toISOString(),
      subtotalItems: orderItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)!
        const client = clients.find((c) => c.id === selectedClient)!
        const price =
          client.type === "Premium" ? product.pricePremium : product.priceNormal
        return price * item.quantity
      }),
      total: calculateTotal(),
    }

    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })

    // Demo: guardar en localStorage
    const savedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    savedOrders.push(order)
    localStorage.setItem("orders", JSON.stringify(savedOrders))

    router.push("/orders")
  }

  const printOrder = () => {
    const orderId = Date.now().toString()
    window.open(`/orders/${orderId}/print`, "_blank")
  }

  if (step === 1) {
    return (
      <ProtectedRoute>
        <Layout title="Nuevo Pedido - Paso 1: Cliente">
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Heading size="md">Seleccionar Cliente</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <FormControl>
                    <FormLabel>Cliente Existente</FormLabel>
                    {loadingClients ? (
                      <Text>Cargando clientes…</Text>
                    ) : clientsError ? (
                      <Text color="red.500">Error: {clientsError}</Text>
                    ) : (
                      <Select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        placeholder="Seleccionar cliente..."
                      >
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name} ({client.type})
                          </option>
                        ))}
                      </Select>
                    )}
                  </FormControl>

                  <Divider />

                  <Heading size="sm">O crear nuevo cliente</Heading>

                  <HStack w="full">
                    <FormControl>
                      <FormLabel>Nombre</FormLabel>
                      <Input
                        value={newClientData.name}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            name: e.target.value,
                          })
                        }
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        value={newClientData.type}
                        onChange={(e) =>
                          setNewClientData({
                            ...newClientData,
                            type: e.target.value as Client["type"],
                          })
                        }
                      >
                        <option value="normal">Normal</option>
                        <option value="premium">Premium</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <Button
                    w="full"
                    onClick={() => setStep(2)}
                    isDisabled={!selectedClient && !newClientData.name}
                  >
                    Continuar
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Layout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Layout title="Nuevo Pedido - Paso 2: Productos">
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md">Agregar Productos</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>Producto</FormLabel>
                    <Select
                      value={currentItem.productId}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          productId: e.target.value,
                        })
                      }
                      placeholder="Seleccionar producto..."
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.priceNormal}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Cantidad</FormLabel>
                    <NumberInput
                      value={currentItem.quantity}
                      onChange={(_, value) =>
                        setCurrentItem({
                          ...currentItem,
                          quantity: value || 1,
                        })
                      }
                      min={1}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel>Tipo de Lista</FormLabel>
                  <RadioGroup
                    value={currentItem.saleType}
                    onChange={(value) =>
                      setCurrentItem({
                        ...currentItem,
                        saleType: value as OrderItem["saleType"],
                      })
                    }
                  >
                    <Stack direction="row">
                      <Radio value="lista1">Lista 1</Radio>
                      <Radio value="lista2">Lista 2</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Button onClick={addItem} w="full">
                  + Agregar Ítem
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <Heading size="md">Resumen del Pedido</Heading>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Producto</Th>
                        <Th>Cantidad</Th>
                        <Th>Precio Unit.</Th>
                        <Th>Subtotal</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {orderItems.map((item, index) => {
                        const product = products.find(
                          (p) => p.id === item.productId
                        )!
                        const client = clients.find(
                          (c) => c.id === selectedClient
                        )!
                        const price =
                          client.type === "Premium"
                            ? product.pricePremium
                            : product.priceNormal
                        const subtotal = price * item.quantity

                        return (
                          <Tr key={index}>
                            <Td>{product.name}</Td>
                            <Td>{item.quantity}</Td>
                            <Td>${price}</Td>
                            <Td>${subtotal}</Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>

                <Divider my={4} />

                <Text fontSize="xl" fontWeight="bold" textAlign="right">
                  Total: ${calculateTotal()}
                </Text>

                <HStack mt={6}>
                  <Button
                    variant="ghost"
                    onClick={() => setStep(1)}
                    w="full"
                  >
                    Volver
                  </Button>
                  <Button onClick={saveOrder} w="full">
                    Guardar Pedido
                  </Button>
                  <Button onClick={printOrder} colorScheme="green" w="full">
                    Imprimir
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
