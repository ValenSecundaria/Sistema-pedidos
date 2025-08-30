// app/orders/new/page.tsx
"use client"

import { useState, useEffect } from "react"
import {
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  Card,
  CardHeader,
  CardBody,
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  useToast,
  useBreakpointValue,
  SimpleGrid,
  Box,
  IconButton,
} from "@chakra-ui/react"
import { CloseIcon } from "@chakra-ui/icons"
import { useRouter } from "next/navigation"

import { Layout } from "@/app/components/layout"
import { ProtectedRoute } from "@/app/components/ProtectedRoute"
import {
  Client,
  Order,
  OrderItem,
  Product,
  RawProduct,
  ClientType,
  EditableOrderItem,
} from "@/app/types"

/**
 * Nota:
 * - Aquí extendemos OrderItem localmente para permitir customPrice por ítem.
 * - No modificamos tus tipos globales (importados), sólo usamos ExtendedOrderItem internamente.
 */
type ExtendedOrderItem = OrderItem & {
  customPrice?: number
}

export default function NewOrderPage(): JSX.Element {
  const router = useRouter()
  const toast = useToast()
  const modalSize = useBreakpointValue({ base: "full", md: "xl" })

  const [step, setStep] = useState<number>(1)
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [newClientData, setNewClientData] = useState<Client>({
    id: "",
    name: "",
    type: "Normal",
    phone: undefined,
    address: undefined,
    name_business: undefined,
    neighborhood: undefined,
  })

  // order items: usamos ExtendedOrderItem internamente
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([])
  const [currentItem, setCurrentItem] = useState<EditableOrderItem>({
    productId: "",
    quantity: 1,
    saleType: "",
  })

  // Datos desde API
  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState<boolean>(true)
  const [clientsError, setClientsError] = useState<string | null>(null)

  const [clientTypes, setClientTypes] = useState<ClientType[]>([])
  const [loadingTypes, setLoadingTypes] = useState<boolean>(true)
  const [typesError, setTypesError] = useState<string | null>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  const [priceLists, setPriceLists] = useState<{ id: number; nombre: string }[]>([])

  // Modal/estado para clientes Premium: confirmar/modificar precio antes de agregar ítem
  const [isPriceModalOpen, setIsPriceModalOpen] = useState<boolean>(false)
  const [pendingItem, setPendingItem] = useState<EditableOrderItem | null>(null)
  const [priceModalProductName, setPriceModalProductName] = useState<string>("")
  const [originalPrice, setOriginalPrice] = useState<number>(0)
  const [suggestedPrice, setSuggestedPrice] = useState<number>(0)
  const [tempPrice, setTempPrice] = useState<number>(0)
  const [priceMode, setPriceMode] = useState<"keep" | "suggested" | "custom">("suggested")

  // Carga inicial: parallel fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoadingClients(true)
      setLoadingTypes(true)
      setLoadingProducts(true)

      try {
        const [clientsRes, clientTypesRes, productsRes, priceListsRes] = await Promise.all([
          fetch("/api/clients-frecuent").then((res) =>
            res.ok ? res.json() : Promise.reject(new Error("Error al cargar clientes"))
          ),
          fetch("/api/clients-types").then((res) =>
            res.ok ? res.json() : Promise.reject(new Error("Error al cargar tipos de cliente"))
          ),
          fetch("/api/products?page=1&limit=100").then((res) =>
            res.ok ? res.json() : Promise.reject(new Error("Error al cargar productos"))
          ),
          fetch("/api/list_box").then((res) =>
            res.ok ? res.json() : Promise.reject(new Error("Error al cargar listas de precios"))
          ),
        ])

        // clientsRes structure expected: { clients: Client[] }
        if (clientsRes?.clients) {
          setClients(clientsRes.clients)
        } else if (Array.isArray(clientsRes)) {
          // fallback
          setClients(clientsRes)
        } else {
          setClients([])
        }

        setClientTypes(clientTypesRes ?? [])

        const productosRaw: RawProduct[] = productsRes?.productos ?? []
        const transformedProducts: Product[] = productosRaw.map((p: RawProduct) => ({
          id: String(p.id),
          name: p.name || "Sin nombre",
          description: p.description ?? "",
          category: p.category ?? "",
          priceNormal: typeof p.priceNormal === "number" ? p.priceNormal : 0,
          // pricePremium stays as before
          pricePremium: typeof p.priceNormal === "number" ? p.priceNormal * 1.2 : 0,
          saleType: "lista1",
        }))
        setProducts(transformedProducts)

        setPriceLists(priceListsRes ?? [])
      } catch (err) {
        console.error("Error al cargar datos:", err)
        const errorMessage = err instanceof Error ? err.message : "Error desconocido"
        if (errorMessage.includes("clientes")) setClientsError(errorMessage)
        if (errorMessage.includes("tipos de cliente")) setTypesError(errorMessage)
        if (errorMessage.includes("productos")) setProductsError(errorMessage)
      } finally {
        setLoadingClients(false)
        setLoadingTypes(false)
        setLoadingProducts(false)
      }
    }

    fetchAllData()
  }, [])

  // Al agregar ítem: si cliente Premium -> abrir modal para confirmar/modificar precio
  const addItem = (): void => {
    if (!currentItem.productId || !currentItem.saleType) {
      alert("Debes seleccionar un producto y un tipo de lista de precios.")
      return
    }

    if (!currentItem.quantity || Number(currentItem.quantity) < 1) {
      alert("Cantidad inválida")
      return
    }

    const product = products.find((p) => p.id === currentItem.productId)
    const client = clients.find((c) => c.id === selectedClient)

    if (!product) {
      alert("Producto no encontrado")
      return
    }
    if (!client) {
      alert("Selecciona un cliente antes de agregar ítems")
      return
    }

    // Si cliente es Premium -> preguntar si mantener o modificar precio
    if (client.type === "Premium") {
      // originalPrice = priceNormal (lo que entiendes por "precio original")
      const orig = product.priceNormal ?? 0
      const sugg = Math.round(orig * 0.9 * 100) / 100 // 10% off, redondeado a 2 decimales
      setOriginalPrice(orig)
      setSuggestedPrice(sugg)
      setTempPrice(sugg) // por defecto mostramos sugerido (pero no es obligatorio)
      setPriceMode("suggested") // modo inicial sugerido
      setPendingItem(currentItem)
      setPriceModalProductName(product.name)
      setIsPriceModalOpen(true)
      return
    }

    // Cliente normal: agregar directamente (sin customPrice)
    const newItem: ExtendedOrderItem = {
      ...currentItem,
      quantity: Number(currentItem.quantity),
    }
    setOrderItems((prev) => [...prev, newItem])
    setCurrentItem({ productId: "", quantity: 1, saleType: "" })
  }

  // Modal actions
  const closePriceModal = (): void => {
    setPendingItem(null)
    setTempPrice(0)
    setPriceModalProductName("")
    setIsPriceModalOpen(false)
    setPriceMode("suggested")
    setCurrentItem({ productId: "", quantity: 1, saleType: "" })
  }

  const applyPriceAndAdd = (mode: "keep" | "suggested" | "custom"): void => {
    if (!pendingItem) {
      closePriceModal()
      return
    }

    const qty = Number(pendingItem.quantity)
    if (!Number.isFinite(qty) || qty <= 0) {
      alert("Cantidad inválida")
      closePriceModal()
      return
    }

    let priceToUse: number | undefined = undefined

    if (mode === "keep") {
      // Mantener precio original: guardamos como customPrice = originalPrice
      priceToUse = originalPrice
    } else if (mode === "suggested") {
      // Usar precio sugerido (10% off)
      priceToUse = suggestedPrice
    } else {
      // custom
      const p = Number(tempPrice ?? NaN)
      if (!Number.isFinite(p) || isNaN(p) || p < 0) {
        alert("Ingrese un precio válido")
        return
      }
      // prevención: no permitir aumentar por encima del original (opcional, implementado)
      if (p > originalPrice) {
        alert("El precio personalizado no puede ser mayor que el precio original.")
        return
      }
      priceToUse = Math.round(p * 100) / 100
    }

    const newItem: ExtendedOrderItem = {
      ...pendingItem,
      quantity: qty,
      customPrice: priceToUse,
    }

    setOrderItems((prev) => [...prev, newItem])
    closePriceModal()
  }

  const calculateTotal = (): number => {
    return orderItems.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return total
      const client = clients.find((c) => c.id === selectedClient)
      if (!client) return total

      // usamos customPrice si existe; si no existe, para Premium usar pricePremium, para normales priceNormal
      const price = item.customPrice ?? (client.type === "Premium" ? product.pricePremium : product.priceNormal)
      return total + price * item.quantity
    }, 0)
  }

  // NEW: eliminar item del pedido en construcción
  const removeItem = (indexToRemove: number): void => {
    setOrderItems((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  // Save order -> enviar unitPrice si customPrice presente (null otherwise)
  const saveOrder = async (): Promise<void> => {
    if (!selectedClient) {
      alert("Selecciona un cliente")
      return
    }
    if (orderItems.length === 0) {
      alert("Agrega al menos un ítem")
      return
    }

    // Armar payload: enviar fecha ISO explícita para evitar problemas de Date inválida en backend
    const payload = {
      clientId: selectedClient,
      dateCreated: new Date().toISOString(),
      items: orderItems.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        saleType: it.saleType,
        unitPrice: typeof it.customPrice === "number" ? it.customPrice : null,
      })),
      total: calculateTotal(),
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => null)
        throw new Error(text || "Error guardando pedido")
      }
      toast({ title: "Pedido creado", status: "success" })
      router.push("/orders")
    } catch (err) {
      console.error("Error al guardar pedido:", err)
      toast({ title: "Error", description: (err as Error).message || "Error al guardar", status: "error" })
    }
  }

  return (
    <ProtectedRoute>
      <Layout title="Nuevo Pedido">
        <VStack spacing={6} align="stretch">
          {step === 1 ? (
            <Card>
              <CardHeader>
                <Heading size="md">Paso 1 — Seleccionar Cliente</Heading>
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

                  <Button w="full" onClick={() => setStep(2)} isDisabled={!selectedClient && !newClientData.name}>
                    Continuar
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <Heading size="md">Paso 2 — Agregar Productos</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <HStack w="full" flexWrap="wrap">
                      <FormControl flex="1 1 320px" minW="240px">
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
                                {product.name} - ${product.priceNormal.toFixed(2)}
                              </option>
                            ))}
                          </Select>
                        )}
                      </FormControl>

                      <FormControl w={{ base: "100%", md: "180px" }}>
                        <FormLabel>Cantidad</FormLabel>
                        <NumberInput
                          value={currentItem.quantity}
                          onChange={(valueString, valueNumber) =>
                            setCurrentItem({
                              ...currentItem,
                              quantity: valueString === "" ? ("" as any) : valueNumber,
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
                        <Stack direction={{ base: "column", md: "row" }}>
                          {priceLists.map((list) => (
                            <Radio key={list.id} value={list.nombre}>
                              {list.nombre}
                            </Radio>
                          ))}
                        </Stack>
                      </RadioGroup>
                    </FormControl>

                    <Button onClick={addItem} w="full" colorScheme="green">
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
                            <Th textAlign="center">Acciones</Th> {/* nueva columna */}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {orderItems.map((item, index) => {
                            const product = products.find((p) => p.id === item.productId)
                            const client = clients.find((c) => c.id === selectedClient)
                            if (!product || !client) return null

                            const price = item.customPrice ?? (client.type === "Premium" ? product.pricePremium : product.priceNormal)
                            const subtotal = price * item.quantity

                            return (
                              <Tr key={index}>
                                <Td>{product.name}</Td>
                                <Td>{item.quantity}</Td>
                                <Td>${price.toFixed(2)}</Td>
                                <Td>${subtotal.toFixed(2)}</Td>
                                <Td textAlign="center">
                                  <IconButton
                                    aria-label={`Eliminar ${product.name}`}
                                    icon={<CloseIcon />}
                                    size="sm"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() => removeItem(index)}
                                    title="Eliminar ítem"
                                  />
                                </Td>
                              </Tr>
                            )
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>

                    <Divider my={4} />

                    <Text fontSize="xl" fontWeight="bold" textAlign="right">
                      Total: ${calculateTotal().toFixed(2)}
                    </Text>

                    <HStack mt={6}>
                      <Button variant="ghost" onClick={() => setStep(1)} w="full">
                        Volver
                      </Button>
                      <Button onClick={saveOrder} w="full" colorScheme="green">
                        Guardar Pedido
                      </Button>
                    </HStack>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {/* Modal que aparece para clientes Premium al agregar ítem */}
          <Modal
            isOpen={isPriceModalOpen}
            onClose={closePriceModal}
            isCentered
            size={modalSize as any}
          >
            <ModalOverlay />
            <ModalContent maxW={{ base: "100%", md: "900px" }} mx={{ base: 0, md: 4 }} my={{ base: 0, md: 16 }}>
              <ModalHeader>Precio para cliente Premium</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={4} align="stretch">
                  <Text fontSize={{ base: "md", md: "lg" }}>
                    Producto: <strong>{priceModalProductName}</strong>
                  </Text>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Left: opciones (radios) */}
                    <Box>
                      <FormControl>
                        <FormLabel>Elija una opción</FormLabel>
                        <RadioGroup onChange={(v) => setPriceMode(v as any)} value={priceMode}>
                          <Stack spacing={3}>
                            <Radio value="keep">
                              Mantener precio original: <strong>${originalPrice.toFixed(2)}</strong>
                            </Radio>
                            <Radio value="suggested">
                              Usar precio sugerido (10% off): <strong>${suggestedPrice.toFixed(2)}</strong>
                            </Radio>
                            <Radio value="custom">Modificar precio manualmente</Radio>
                          </Stack>
                        </RadioGroup>
                      </FormControl>
                    </Box>

                    {/* Right: panel de precio y detalles */}
                    <Box>
                      <FormControl>
                        <FormLabel>Precio actual / editar</FormLabel>
                        <NumberInput
                          value={tempPrice}
                          min={0}
                          precision={2}
                          onChange={(_, val) => setTempPrice(val)}
                          isDisabled={priceMode !== "custom"}
                        >
                          <NumberInputField />
                        </NumberInput>

                        <Text mt={2} fontSize="sm" color="gray.500">
                          Sugerido: <strong>${suggestedPrice.toFixed(2)}</strong> — Original: <strong>${originalPrice.toFixed(2)}</strong>.
                          Si eliges "Mantener precio" se usará el precio original.
                        </Text>
                      </FormControl>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Stack direction={{ base: "column", md: "row" }} spacing={3} w="full">
                  <Button variant="ghost" onClick={closePriceModal} flex={{ base: "1", md: "0" }}>
                    Cancelar
                  </Button>

                  <Box flex="1" />

                  <Button onClick={() => applyPriceAndAdd("keep")} mr={{ base: 0, md: 2 }} flex={{ base: 1, md: "initial" }}>
                    Mantener original
                  </Button>
                  <Button onClick={() => applyPriceAndAdd("suggested")} mr={{ base: 0, md: 2 }} flex={{ base: 1, md: "initial" }}>
                    Usar sugerido
                  </Button>
                  <Button colorScheme="blue" onClick={() => applyPriceAndAdd("custom")} flex={{ base: 1, md: "initial" }}>
                    Guardar precio modificado y agregar
                  </Button>
                </Stack>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
