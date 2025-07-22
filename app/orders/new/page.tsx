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
import { Client, Order, OrderItem, Product , RawProduct, ClientType} from "@/app/types"



export default function NewOrderPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedClient, setSelectedClient] = useState("")
  const [newClientData, setNewClientData] = useState<Client>({
    id: "",
    name: "",
    type: "Normal",
    phone: undefined,
    address: undefined,
    name_business: undefined,
    neighborhood: undefined,
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentItem, setCurrentItem] = useState<OrderItem>({
    productId: "",
    quantity: 1,
    saleType: "",
  })

  // Clientes desde API
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [clientsError, setClientsError] = useState<string | null>(null)

  // Tipos de clientes desde API
  const [clientTypes, setClientTypes] = useState<ClientType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [typesError, setTypesError] = useState<string | null>(null)

  // Productos desde API
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  // Listas de precios desde API
  const [priceLists, setPriceLists] = useState<{ id: number; nombre: string }[]>([])

  useEffect(() => {
    const fetchAllData = async () => {
      // Inicializar estados de carga
      setLoadingClients(true)
      setLoadingTypes(true)
      setLoadingProducts(true)

      try {
        // Ejecutar todas las solicitudes en paralelo
        const [clientsRes, clientTypesRes, productsRes, priceListsRes] = await Promise.all([
          fetch("/api/clients-frecuent").then(res => res.ok ? res.json() : Promise.reject(new Error("Error al cargar clientes"))),
          fetch("/api/clients-types").then(res => res.ok ? res.json() : Promise.reject(new Error("Error al cargar tipos de cliente"))),
          fetch("/api/products?page=1&limit=10").then(res => res.ok ? res.json() : Promise.reject(new Error("Error al cargar productos"))),
          fetch("/api/list_box").then(res => res.ok ? res.json() : Promise.reject(new Error("Error al cargar listas de precios")))
        ])

        // Procesar clientes
        console.log("Clientes recibidos:", clientsRes)
        setClients(clientsRes.clients)

        // Procesar tipos de clientes
        console.log("Tipos de cliente recibidos:", clientTypesRes)
        setClientTypes(clientTypesRes)

        // Procesar productos
        console.log("Respuesta completa de productos:", productsRes)
        console.log("Solo productos:", productsRes.productos)
        if (productsRes.productos?.length > 0) {
          console.log("Keys del primer producto:", Object.keys(productsRes.productos[0]))
          console.log("Primer producto crudo:", productsRes.productos[0])
        }
        const transformedProducts: Product[] = (productsRes.productos || []).map((p: RawProduct) => ({
          id: String(p.id),
          name: p.name || "Sin nombre",
          description: p.description ?? "",
          category: p.category ?? "",
          priceNormal: typeof p.priceNormal === "number" ? p.priceNormal : 0,
          pricePremium: typeof p.priceNormal === "number" ? p.priceNormal * 1.2 : 0,
          saleType: "lista1",
        }))
        console.log("Productos transformados:", transformedProducts)
        setProducts(transformedProducts)

        // Procesar listas de precios
        console.log("Listas de precios recibidas:", priceListsRes)
        setPriceLists(priceListsRes)
      } catch (err) {
        console.error("Error al cargar datos:", err)
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        if (errorMessage.includes("clientes")) setClientsError(errorMessage)
        if (errorMessage.includes("tipos de cliente")) setTypesError(errorMessage)
        if (errorMessage.includes("productos")) setProductsError(errorMessage)
        // No hay estado de error para priceLists, pero podrías agregarlo si necesitas
      } finally {
        setLoadingClients(false)
        setLoadingTypes(false)
        setLoadingProducts(false)
      }
    }

    fetchAllData()
  }, [])

  const addItem = () => {
  if (!currentItem.productId || !currentItem.saleType) {
    alert("Debes seleccionar un producto y un tipo de lista de precios.")
    return
  }

  setOrderItems([...orderItems, { ...currentItem }])
  setCurrentItem({
    productId: "",
    quantity: 1,
    saleType: "", // Reiniciar a vacío para forzar selección
  })
}

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return total

      const client = clients.find((c) => c.id === selectedClient)
      if (!client) return total

      const price = client.type === "Premium" ? product.pricePremium : product.priceNormal
      return total + price * item.quantity
    }, 0)
  }

  const saveOrder = async () => {
    if (!selectedClient || orderItems.length === 0) return

    const order: Order = {
      id: Date.now().toString(),
      clientId: selectedClient,
      items: orderItems,
      dateCreated: new Date().toISOString(),
      subtotalItems: orderItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (!product) return 0
        const client = clients.find((c) => c.id === selectedClient)
        if (!client) return 0
        const price = client.type === "Premium" ? product.pricePremium : product.priceNormal
        return price * item.quantity
      }),
      total: calculateTotal(),
    }

    try {
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
    } catch (error) {
      console.error("Error al guardar el pedido:", error)
    }
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
              <Card>
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
                      {loadingTypes ? (
                        <Text>Cargando tipos de cliente…</Text>
                      ) : typesError ? (
                        <Text color="red.500">Error: {typesError}</Text>
                      ) : (
                        <Select
                          value={newClientData.type}
                          onChange={(e) =>
                            setNewClientData({
                              ...newClientData,
                              type: e.target.value as Client["type"],
                            })
                          }
                          placeholder="Seleccionar tipo de cliente..."
                        >
                          {clientTypes.map((type) => (
                            <option key={type.id} value={type.nombre}>
                              {type.nombre}
                            </option>
                          ))}
                        </Select>
                      )}
                    </FormControl>
                  </HStack>
                  {typesError && (
                    <Text color="red.500" mt={2}>
                      Error cargando tipos de cliente: {typesError}
                    </Text>
                  )}

                  <Button
                    w="full"
                    onClick={() => setStep(2)}
                    isDisabled={!selectedClient && !newClientData.name}
                  >
                    Continuar
                  </Button>
                </VStack>
              </Card>
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
            <Card>
              <VStack spacing={4}>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>Producto</FormLabel>
                    {loadingProducts ? (
                      <Text>Cargando productos…</Text>
                    ) : productsError ? (
                      <Text color="red.500">Error: {productsError}</Text>
                    ) : (
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
                    )}
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
                      {priceLists.map((list) => (
                        <Radio key={list.id} value={list.nombre}>
                          {list.nombre}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                </FormControl>

                <Button onClick={addItem} w="full">
                  + Agregar Ítem
                </Button>
              </VStack>
            </Card>
          </Card>

          {orderItems.length > 0 && (
            <Card>
              <CardHeader>
                <Heading size="md">Resumen del Pedido</Heading>
              </CardHeader>
              <Card>
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
                        const product = products.find((p) => p.id === item.productId)
                        const client = clients.find((c) => c.id === selectedClient)
                        if (!product || !client) return null
                        const price =
                          client.type === "Premium" ? product.pricePremium : product.priceNormal
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
                  <Button variant="ghost" onClick={() => setStep(1)} w="full">
                    Volver
                  </Button>
                  <Button onClick={saveOrder} w="full">
                    Guardar Pedido
                  </Button>
                  <Button onClick={printOrder} colorScheme="green" w="full">
                    Imprimir
                  </Button>
                </HStack>
              </Card>
            </Card>
          )}
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}