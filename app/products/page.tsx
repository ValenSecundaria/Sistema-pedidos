"use client"

import type React from "react"

import { useState } from "react"
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
} from "@chakra-ui/react"

import { ProtectedRoute } from "../components/ProtectedRoute"
import type { Product } from "../types"
import { Layout } from "../components/layout"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "carpeta1" as Product["category"],
    priceNormal: 0,
    pricePremium: 0,
    saleType: "lista1" as Product["saleType"],
  })

  const isMobile = useBreakpointValue({ base: true, md: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newProduct: Product = {
      id: Date.now().toString(),
      ...formData,
    }

    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    })

    setProducts([...products, newProduct])
    setFormData({
      name: "",
      description: "",
      category: "carpeta1",
      priceNormal: 0,
      pricePremium: 0,
      saleType: "lista1",
    })
    onClose()
  }

  return (
    <ProtectedRoute>
      <Layout title="Productos">
        <VStack spacing={6} align="stretch">
          <Button
            onClick={onOpen}
            size="xl"
            colorScheme="green"
            w="full"
            maxW={{ base: "100%", md: "300px" }}
            h="70px"
            fontSize="20px"
          >
            ➕ Agregar Nuevo Producto
          </Button>

          {/* Tabla responsive */}
          {isMobile ? (
            // Vista móvil: Cards en lugar de tabla
            <VStack spacing={4}>
              {products.length === 0 ? (
                <Card w="full">
                  <CardBody textAlign="center" py={12}>
                    <Text fontSize="xl" color="gray.500">
                      No hay productos registrados
                    </Text>
                    <Text fontSize="lg" color="gray.400" mt={2}>
                      Agregue su primer producto
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
                        <HStack justify="space-between" w="full">
                          <Text fontSize="lg" fontWeight="600">
                            Categoría:
                          </Text>
                          <Text fontSize="lg">{product.category}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="lg" fontWeight="600">
                            Precio Normal:
                          </Text>
                          <Text fontSize="lg" color="green.600" fontWeight="700">
                            ${product.priceNormal}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="lg" fontWeight="600">
                            Precio Premium:
                          </Text>
                          <Text fontSize="lg" color="blue.600" fontWeight="700">
                            ${product.pricePremium}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="lg" fontWeight="600">
                            Tipo:
                          </Text>
                          <Text fontSize="lg">{product.saleType}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))
              )}
            </VStack>
          ) : (
            // Vista desktop: Tabla tradicional
            <Card>
              <CardBody p={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Nombre</Th>
                        <Th>Categoría</Th>
                        <Th isNumeric>Precio Normal</Th>
                        <Th isNumeric>Precio Premium</Th>
                        <Th>Tipo de Venta</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {products.map((product) => (
                        <Tr key={product.id}>
                          <Td fontWeight="600">{product.name}</Td>
                          <Td>{product.category}</Td>
                          <Td isNumeric color="green.600" fontWeight="700">
                            ${product.priceNormal}
                          </Td>
                          <Td isNumeric color="blue.600" fontWeight="700">
                            ${product.pricePremium}
                          </Td>
                          <Td>{product.saleType}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          )}

          {/* Modal del formulario */}
          <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
            <ModalOverlay />
            <ModalContent mx={{ base: 0, md: 4 }} my={{ base: 0, md: 16 }}>
              <ModalHeader fontSize="2xl" fontWeight="700">
                Agregar Nuevo Producto
              </ModalHeader>
              <ModalCloseButton size="lg" />
              <ModalBody pb={8}>
                <form onSubmit={handleSubmit}>
                  <VStack spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Nombre del Producto</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Producto A"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Descripción</FormLabel>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción del producto..."
                        minH="100px"
                        fontSize="18px"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Categoría</FormLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as Product["category"] })}
                      >
                        <option value="carpeta1">Carpeta 1</option>
                        <option value="carpeta2">Carpeta 2</option>
                        <option value="carpeta3">Carpeta 3</option>
                      </Select>
                    </FormControl>

                    <VStack spacing={4} w="full">
                      <FormControl isRequired>
                        <FormLabel>Precio Normal</FormLabel>
                        <NumberInput
                          value={formData.priceNormal}
                          onChange={(_, value) => setFormData({ ...formData, priceNormal: value || 0 })}
                          min={0}
                          precision={2}
                        >
                          <NumberInputField fontSize="18px" h="60px" />
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
                          <NumberInputField fontSize="18px" h="60px" />
                        </NumberInput>
                      </FormControl>
                    </VStack>

                    <FormControl isRequired>
                      <FormLabel>Tipo de Venta</FormLabel>
                      <Select
                        value={formData.saleType}
                        onChange={(e) => setFormData({ ...formData, saleType: e.target.value as Product["saleType"] })}
                      >
                        <option value="lista1">Lista 1</option>
                        <option value="lista2">Lista 2</option>
                      </Select>
                    </FormControl>

                    <VStack spacing={4} w="full" pt={4}>
                      <Button type="submit" w="full" size="xl">
                        Guardar Producto
                      </Button>
                      <Button variant="outline" onClick={onClose} w="full" size="lg">
                        Cancelar
                      </Button>
                    </VStack>
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
