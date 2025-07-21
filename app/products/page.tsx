"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  VStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  Textarea,
  HStack,
  useBreakpointValue,
  Card,
  CardBody,
  Text,
  Heading,
  Spinner,
  Center,
} from "@chakra-ui/react"



import { ProtectedRoute } from "../components/ProtectedRoute"
import { Layout } from "../components/layout"
import type { Product, Category , RawProduct} from "../types"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [priceLists, setPriceLists] = useState<{ id: number; nombre: string }[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoria_id: null as number | null,
    priceNormal: 0,
    pricePremium: 0,
    saleType_id: null as number | null,
  })

  const isMobile = useBreakpointValue({ base: true, md: false })

  const fetchProducts = async (page: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?page=${page}&limit=10`)
      if (res.ok) {
        const data: { productos: RawProduct[]; totalPages: number; page: number } = await res.json()

        console.log("Respuesta completa de productos:", data)
        console.log("Solo productos:", data.productos)

        // Verificamos shape:
        if (data.productos.length > 0) {
          console.log("Keys del primer producto:", Object.keys(data.productos[0]))
          console.log("Primer producto crudo:", data.productos[0])
        }

        // Transformación usando las claves exactas:
        const transformedProducts: Product[] = data.productos.map(p => ({
          id: String(p.id),
          name: p.name,
          description: p.description ?? "",
          category: p.category ?? "",
          priceNormal: typeof p.priceNormal === "number" ? p.priceNormal : 0,
          pricePremium: 0,   // si luego quieres asignarle valor, cámbialo aquí
          saleType: "",      // igual para saleType
        }))

        console.log("Productos transformados:", transformedProducts)

        setProducts(transformedProducts)
        setTotalPages(data.totalPages)
        setPage(data.page)
      } else {
        console.error("Fetch falló con status", res.status)
      }
    } catch (err) {
      console.error("Error al obtener productos:", err)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    fetchProducts(page)

    const fetchCategories = async () => {
      const res = await fetch("/api/categories")
      if (res.ok) setCategories(await res.json())
    }

    const fetchPriceLists = async () => {
      const res = await fetch("/api/list_box")
      if (res.ok) setPriceLists(await res.json())
    }

    fetchCategories()
    fetchPriceLists()
  }, [page])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      nombre: formData.name,
      descripcion: formData.description || null,
      categoria_id: formData.categoria_id,
      precio_unitario: formData.priceNormal,
      saleType_id: formData.saleType_id,
      pricePremium: formData.pricePremium,
    }

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    await fetchProducts(1)

    setFormData({
      name: "",
      description: "",
      categoria_id: null,
      priceNormal: 0,
      pricePremium: 0,
      saleType_id: null,
    })
    onClose()
  }

  return (
    <ProtectedRoute>
      <Layout title="Productos">
        <VStack spacing={6} align="stretch">
          <Button onClick={onOpen} size="xl" colorScheme="green" h="70px" fontSize="20px">
            ➕ Agregar Nuevo Producto
          </Button>

          {/* 🔄 Mostrar Spinner si está cargando */}
          {loading ? (
            <Center py={20}>
              <Spinner size="xl" thickness="4px" color="green.500" />
            </Center>
          ) : isMobile ? (
            <VStack spacing={4}>
              {products.length === 0 ? (
                <Card w="full">
                  <CardBody textAlign="center" py={12}>
                    <Text fontSize="xl" color="gray.500">
                      No hay productos registrados
                    </Text>
                  </CardBody>
                </Card>
              ) : (
                products.map((product) => (
                  <Card key={product.id} w="full">
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Heading size="md" color="brand.600">
                          {product.name}
                        </Heading>
                        <Text><strong>Categoría:</strong> {product.category}</Text>
                        <Text color="green.600">
                          <strong>Precio Normal:</strong> ${product.priceNormal.toFixed(2)}
                        </Text>
                        <Text color="blue.600">
                          <strong>Precio Premium:</strong> ${product.pricePremium.toFixed(2)}
                        </Text>
                        <Text><strong>Tipo:</strong> {product.saleType}</Text>
                      </VStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>
          ) : (
            <Card>
              <CardBody p={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Nombre</Th>
                        <Th>Categoría</Th>
                        <Th isNumeric>Precio Unitario</Th>
                        {/* <Th isNumeric>Precio Premium</Th>  // eliminar o comentar */}
                        {/* <Th>Tipo de Venta</Th>  // eliminar o comentar */}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {products.map((product) => (
                        <Tr key={product.id}>
                          <Td>{product.name}</Td>
                          <Td>{product.category}</Td>
                          <Td isNumeric>${product.priceNormal.toFixed(2)}</Td>
                          {/* <Td isNumeric>${product.pricePremium.toFixed(2)}</Td> */}
                          {/* <Td>{product.saleType}</Td> */}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          )}

          {/* Pagination */}
          <HStack justify="center" spacing={4}>
            <Button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </Button>
            <Text>Página {page} de {totalPages}</Text>
            <Button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Siguiente
            </Button>
          </HStack>

          {/* Modal */}
          <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
            <ModalOverlay />
            <ModalContent mx={{ base: 0, md: 4 }} my={{ base: 0, md: 16 }}>
              <ModalHeader fontSize="2xl" fontWeight="700">Agregar Nuevo Producto</ModalHeader>
              <ModalCloseButton size="lg" />
              <ModalBody pb={8}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Descripción</FormLabel>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        minH="100px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        placeholder="Selecciona una categoría"
                        value={formData.categoria_id?.toString() || ""}
                        onChange={(e) => setFormData({ ...formData, categoria_id: parseInt(e.target.value) })}
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Precio Normal</FormLabel>
                      <NumberInput
                        value={formData.priceNormal}
                        onChange={(_, value) => setFormData({ ...formData, priceNormal: value || 0 })}
                        min={0}
                        precision={2}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Precio Premium</FormLabel>
                      <NumberInput
                        value={formData.pricePremium}
                        onChange={(_, value) => setFormData({ ...formData, pricePremium: value || 0 })}
                        min={0}
                        precision={2}
                      >
                        <NumberInputField />
                      </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Tipo de Venta</FormLabel>
                      <Select
                        placeholder="Selecciona un tipo de venta"
                        value={formData.saleType_id?.toString() || ""}
                        onChange={(e) => setFormData({ ...formData, saleType_id: parseInt(e.target.value) })}
                      >
                        {priceLists.map((pl) => (
                          <option key={pl.id} value={pl.id}>{pl.nombre}</option>
                        ))}
                      </Select>
                    </FormControl>

                    <HStack spacing={4} w="full" pt={4}>
                      <Button type="submit" size="lg" colorScheme="green" flex={1}>
                        Guardar
                      </Button>
                      <Button variant="outline" size="lg" onClick={onClose} flex={1}>
                        Cancelar
                      </Button>
                    </HStack>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
