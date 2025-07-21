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
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  HStack,
  useBreakpointValue,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react"

import { ProtectedRoute } from "../components/ProtectedRoute"
import type { Client, ClientInput } from "../types"
import { Layout } from "../components/layout"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    name: "",
    type: "Normal" as Client["type"],
    phone: "",
    address: "",
    name_business: "",
    neighborhood: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isMobile = useBreakpointValue({ base: true, md: false })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "El número de celular es obligatorio"
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Ingrese un número de celular válido (10-15 dígitos)"
    }
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    const newClientInput: ClientInput = {
      name: formData.name.trim(),
      type: formData.type,
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      name_business: formData.name_business.trim() || undefined,
      neighborhood: formData.neighborhood.trim() || undefined,
    }

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientInput),
      })

      if (!res.ok) {
        throw new Error("Error al crear el cliente")
      }

      const createdClient: Client = await res.json()
      setClients([...clients, createdClient])

      // Limpiar
      setFormData({
        name: "",
        type: "Normal",
        phone: "",
        address: "",
        name_business: "",
        neighborhood: "",
      })
      setErrors({})
    } catch (error) {
      console.error("Error creando cliente:", error)
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <ProtectedRoute>
      <Layout title="Gestión de Clientes">
        <VStack spacing={8} align="stretch">
          {/* Formulario para agregar cliente */}
          <Card borderWidth="2px" borderColor="orange.200">
            <CardHeader bg="orange.50">
              <Heading size="lg" color="orange.700" textAlign="center">
                ➕ Agregar Nuevo Cliente
              </Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={6}>
                  {/* Campos Obligatorios */}
                  <Card w="full" bg="red.50" borderColor="red.200" borderWidth="1px">
                    <CardBody>
                      <VStack spacing={4}>
                        <Heading size="md" color="red.700" textAlign="center">
                          📋 Información Obligatoria
                        </Heading>

                        <HStack w="full" spacing={4} flexDirection={{ base: "column", md: "row" }}>
                          <FormControl isRequired isInvalid={!!errors.name}>
                            <FormLabel>Nombre Completo</FormLabel>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="Ej: Juan Pérez"
                              bg="white"
                            />
                            <FormErrorMessage>{errors.name}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Tipo de Cliente</FormLabel>
                            <Select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as Client["type"] })}
                              bg="white"
                            >
                              <option value="Normal">Cliente Normal</option>
                              <option value="Premium">Cliente Premium</option>
                            </Select>
                          </FormControl>
                        </HStack>

                        <FormControl isRequired isInvalid={!!errors.phone}>
                          <FormLabel>Número de Celular</FormLabel>
                          <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="Ej: 1234567890"
                            type="tel"
                            bg="white"
                          />
                          <FormErrorMessage>{errors.phone}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.address}>
                          <FormLabel>Dirección Completa</FormLabel>
                          <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Ej: Calle 123 #45-67"
                            bg="white"
                          />
                          <FormErrorMessage>{errors.address}</FormErrorMessage>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Campos Opcionales */}
                  <Card w="full" bg="blue.50" borderColor="blue.200" borderWidth="1px">
                    <CardBody>
                      <VStack spacing={4}>
                        <Heading size="md" color="blue.700" textAlign="center">
                          📝 Información Opcional
                        </Heading>

                        <HStack w="full" spacing={4} flexDirection={{ base: "column", md: "row" }}>
                          <FormControl>
                            <FormLabel>Nombre del Negocio</FormLabel>
                            <Input
                              value={formData.name_business}
                              onChange={(e) => setFormData({ ...formData, name_business: e.target.value })}
                              placeholder="Ej: Tienda El Buen Precio"
                              bg="white"
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Barrio</FormLabel>
                            <Input
                              value={formData.neighborhood}
                              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                              placeholder="Ej: Centro, La Candelaria"
                              bg="white"
                            />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Button
                    type="submit"
                    w="full"
                    size="xl"
                    colorScheme="orange"
                    isLoading={isSubmitting}
                    loadingText="Guardando cliente..."
                    maxW="400px"
                  >
                    💾 Guardar Cliente
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Lista de Clientes */}
          <Card>
            <CardHeader>
              <Heading size="lg" color="gray.700" textAlign="center">
                👥 Lista de Clientes Registrados
              </Heading>
            </CardHeader>
            <CardBody>
              {clients.length === 0 ? (
                <VStack spacing={4} py={8}>
                  <Text fontSize="48px">👤</Text>
                  <Text fontSize="xl" color="gray.500" textAlign="center">
                    No hay clientes registrados
                  </Text>
                  <Text fontSize="lg" color="gray.400" textAlign="center">
                    Agregue su primer cliente usando el formulario de arriba
                  </Text>
                </VStack>
              ) : (
                <>
                  {isMobile ? (
                    // Vista móvil: Cards
                    <VStack spacing={4}>
                      {clients.map((client) => (
                        <Card key={client.id} w="full" borderWidth="1px">
                          <CardBody>
                            <VStack align="start" spacing={3}>
                              <HStack justify="space-between" w="full">
                                <Heading size="md" color="orange.600">
                                  {client.name}
                                </Heading>
                                <Text
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                  bg={client.type === "Premium" ? "blue.100" : "gray.100"}
                                  color={client.type === "Premium" ? "blue.700" : "gray.700"}
                                  borderRadius="md"
                                  fontWeight="600"
                                >
                                  {client.type === "Premium" ? "Premium" : "NORMAL"}
                                </Text>
                              </HStack>

                              <VStack align="start" spacing={2} w="full">
                                <HStack>
                                  <Text fontSize="lg" fontWeight="600">
                                    📱
                                  </Text>
                                  <Text fontSize="lg">{client.phone}</Text>
                                </HStack>
                                <HStack align="start">
                                  <Text fontSize="lg" fontWeight="600">
                                    📍
                                  </Text>
                                  <Text fontSize="lg">{client.address}</Text>
                                </HStack>
                                {client.name_business && (
                                  <HStack>
                                    <Text fontSize="lg" fontWeight="600">
                                      🏪
                                    </Text>
                                    <Text fontSize="lg">{client.name_business}</Text>
                                  </HStack>
                                )}
                                {client.neighborhood && (
                                  <HStack>
                                    <Text fontSize="lg" fontWeight="600">
                                      🏘️
                                    </Text>
                                    <Text fontSize="lg">{client.neighborhood}</Text>
                                  </HStack>
                                )}
                              </VStack>
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
                            <Th>Nombre</Th>
                            <Th>Tipo</Th>
                            <Th>Teléfono</Th>
                            <Th>Dirección</Th>
                            <Th>Negocio</Th>
                            <Th>Barrio</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {clients.map((client) => (
                            <Tr key={client.id}>
                              <Td fontWeight="600">{client.name}</Td>
                              <Td>
                                <Text
                                  fontSize="sm"
                                  px={2}
                                  py={1}
                                  bg={client.type === "Premium" ? "blue.100" : "gray.100"}
                                  color={client.type === "Premium" ? "blue.700" : "gray.700"}
                                  borderRadius="md"
                                  fontWeight="600"
                                  textAlign="center"
                                >
                                  {client.type === "Premium" ? "Premium" : "NORMAL"}
                                </Text>
                              </Td>
                              <Td>{client.phone}</Td>
                              <Td>{client.address}</Td>
                              <Td>{client.name_business || "-"}</Td>
                              <Td>{client.neighborhood || "-"}</Td>
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
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
