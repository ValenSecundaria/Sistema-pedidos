'use client'

import React, { useEffect, useRef, useState } from "react"
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Spinner,
  Center,
  Box,
} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons"

import { ProtectedRoute } from "../components/ProtectedRoute"
import type { Client, ClientInput } from "../types"
import { Layout } from "../components/layout"

type EditForm = {
  name: string
  type: string
  phone: string
  address: string
  name_business?: string | null
  neighborhood?: string | null
}

export default function ClientsPage(): JSX.Element {
  // lista y paginación
  const [clients, setClients] = useState<Client[]>([])
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  // crear cliente (form original)
  const [formData, setFormData] = useState({
    name: "",
    type: "Normal" as Client["type"],
    phone: "",
    address: "",
    name_business: "",
    neighborhood: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [clientTypes, setClientTypes] = useState<{ id: number; nombre: string }[]>([])

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
  const [editLoading, setEditLoading] = useState<boolean>(false)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    name: '',
    type: 'Normal',
    phone: '',
    address: '',
    name_business: undefined,
    neighborhood: undefined,
  })
  const [editErrors, setEditErrors] = useState<Record<string, string>>({})

  // Delete dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<boolean>(false)
  const cancelDeleteRef = useRef<HTMLButtonElement | null>(null)

  // responsive
  const isMobile = useBreakpointValue({ base: true, md: false })

  // reutilizable: validación simple (usada por crear y editar)
  const validateClientInput = (data: ClientInput) => {
    const newErrors: Record<string, string> = {}
    if (!data.name?.trim()) newErrors.name = "El nombre es obligatorio"
    if (!data.phone?.trim()) newErrors.phone = "El número de celular es obligatorio"
    else if (!/^\d{10,15}$/.test(data.phone.replace(/\s/g, "")))
      newErrors.phone = "Ingrese un número de celular válido (10-15 dígitos)"
    if (!data.address?.trim()) newErrors.address = "La dirección es obligatoria"
    return newErrors
  }

  // Cargar tipos de cliente
  useEffect(() => {
    const fetchClientTypes = async () => {
      try {
        const res = await fetch("/api/clients-types")
        if (!res.ok) throw new Error("No se pudieron cargar tipos de cliente")
        const data = await res.json()
        setClientTypes(data)
      } catch (err) {
        console.error("Error cargando tipos de cliente:", err)
        setClientTypes([])
      }
    }
    fetchClientTypes()
  }, [])

  // fetch clients (lista paginada)
  const fetchClients = async (pageNumber: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/clients?page=${pageNumber}&limit=5`)
      if (!res.ok) throw new Error("Error al cargar clientes")
      const data = await res.json()
      setClients(data.clients ?? [])
      setPage(data.page ?? pageNumber)
      setTotalPages(data.totalPages ?? 1)
    } catch (error) {
      console.error("Error cargando clientes:", error)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  // crear cliente (mantengo tu flow)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newClientInput: ClientInput = {
      name: formData.name.trim(),
      type: formData.type,
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      name_business: formData.name_business.trim() || undefined,
      neighborhood: formData.neighborhood.trim() || undefined,
    }

    const newErrors = validateClientInput(newClientInput)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClientInput),
      })
      if (!res.ok) {
        let msg = "Error al crear el cliente"
        try {
          const b = await res.clone().json()
          msg = (b?.error || b?.message) ?? msg
        } catch {
          try { const t = await res.clone().text(); if (t) msg = t } catch {}
        }
        throw new Error(msg)
      }

      // refrescar y reset
      await fetchClients(1)
      setFormData({
        name: "",
        type: "Normal",
        phone: "",
        address: "",
        name_business: "",
        neighborhood: "",
      })
      setErrors({})
      setPage(1)
    } catch (err) {
      console.error("Error creando cliente:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // abrir modal editar -> traer datos del cliente por id
  const openEditModal = async (id: string) => {
    setIsEditOpen(true)
    setEditingClientId(id)
    setEditLoading(true)
    setEditErrors({})

    try {
      // pedimos los datos completos del cliente (no los pedidos)
      const res = await fetch(`/api/clients/${id}?onlyClient=true`)
      if (!res.ok) throw new Error('No se pudo obtener datos del cliente')
      const data = await res.json() as {
        id: string
        name: string
        typeId?: number | null
        typeName?: string | null
        phone?: string | null
        address?: string | null
        name_business?: string | null
        neighborhood?: string | null
      }

      setEditForm({
        name: data.name ?? '',
        type: data.typeName ?? 'Normal',
        phone: data.phone ?? '',
        address: data.address ?? '',
        name_business: data.name_business ?? undefined,
        neighborhood: data.neighborhood ?? undefined,
      })
    } catch (err) {
      console.error('Error cargando cliente para editar:', err)
      // En caso de error, mantenemos el modal abierto pero con el formulario vacío o con fallback
      setEditForm({
        name: '',
        type: 'Normal',
        phone: '',
        address: '',
        name_business: undefined,
        neighborhood: undefined,
      })
      setEditErrors({ __global: 'No se pudieron cargar los datos del cliente' })
    } finally {
      setEditLoading(false)
    }
  }

  const closeEditModal = () => {
    setIsEditOpen(false)
    setEditingClientId(null)
    setEditForm({
      name: "",
      type: "Normal",
      phone: "",
      address: "",
      name_business: undefined,
      neighborhood: undefined,
    })
    setEditErrors({})
  }

  // guardar cambios del cliente editado
  const saveEdit = async () => {
    if (!editingClientId) return
    const payload: ClientInput = {
      name: editForm.name.trim(),
      type: editForm.type,
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      name_business: editForm.name_business?.trim() || undefined,
      neighborhood: editForm.neighborhood?.trim() || undefined,
    }

    // validación
    const validation = validateClientInput(payload)
    setEditErrors(validation)
    if (Object.keys(validation).length > 0) return

    setEditLoading(true)
    try {
      // suponemos PUT para actualizar; si tu backend usa POST/PATCH, adaptá aquí
      const res = await fetch(`/api/clients/${editingClientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        let errMsg = "Error actualizando cliente"
        try {
          const body = await res.clone().json()
          errMsg = (body?.error || body?.message) ?? errMsg
        } catch {
          try { const txt = await res.clone().text(); if (txt) errMsg = txt } catch {}
        }
        throw new Error(errMsg)
      }

      // refrescar lista manteniendo la página actual
      await fetchClients(page)
      closeEditModal()
    } catch (err) {
      console.error("Error guardando edición:", err)
      setEditErrors({ __global: (err instanceof Error ? err.message : String(err)) })
    } finally {
      setEditLoading(false)
    }
  }

  // abrir dialogo eliminar
  const openDeleteDialog = (id: string) => {
    setDeletingClientId(id)
    setIsDeleteOpen(true)
  }
  const closeDeleteDialog = () => {
    setDeletingClientId(null)
    setIsDeleteOpen(false)
  }

  // confirmar eliminación
  const confirmDelete = async () => {
    if (!deletingClientId) return
    setDeleting(true)
    try {
      // Pedimos borrado con cascade
      const res = await fetch(`/api/clients/${deletingClientId}?cascade=true`, { method: 'DELETE' })
      if (!res.ok) {
        let msg = 'Error eliminando cliente'
        try {
          const b = await res.clone().json()
          msg = (b?.error || b?.message) ?? msg
        } catch {
          try { const t = await res.clone().text(); if (t) msg = t } catch {}
        }
        throw new Error(msg)
      }

      // refrescar
      await fetchClients(page)
      closeDeleteDialog()
    } catch (err) {
      console.error('Error eliminando cliente:', err)
      // opcional: mostrar error al usuario en UI
    } finally {
      setDeleting(false)
    }
  }

  // paginación controles
  const handleNextPage = () => { if (page < totalPages) setPage(prev => prev + 1) }
  const handlePrevPage = () => { if (page > 1) setPage(prev => prev - 1) }

  // botón de acción centralizado (para tabla)
  const ActionButtons = ({ id }: { id: string }) => (
    <HStack spacing={2} justify="center">
      <IconButton aria-label="Editar" icon={<EditIcon />} size="sm" onClick={() => openEditModal(id)} />
      <IconButton aria-label="Eliminar" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => openDeleteDialog(id)} />
    </HStack>
  )

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
                            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ej: Juan Pérez" bg="white" />
                            <FormErrorMessage>{errors.name}</FormErrorMessage>
                          </FormControl>

                          <FormControl isRequired>
                            <FormLabel>Tipo de Cliente</FormLabel>
                            <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as Client["type"] })} bg="white" placeholder="Seleccionar tipo">
                              {clientTypes.map((type) => <option key={type.id} value={type.nombre}>{type.nombre}</option>)}
                            </Select>
                          </FormControl>
                        </HStack>

                        <FormControl isRequired isInvalid={!!errors.phone}>
                          <FormLabel>Número de Celular</FormLabel>
                          <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Ej: 1234567890" type="tel" bg="white" />
                          <FormErrorMessage>{errors.phone}</FormErrorMessage>
                        </FormControl>

                        <FormControl isRequired isInvalid={!!errors.address}>
                          <FormLabel>Dirección Completa</FormLabel>
                          <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Ej: Calle 123 #45-67" bg="white" />
                          <FormErrorMessage>{errors.address}</FormErrorMessage>
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Campos Opcionales */}
                  <Card w="full" bg="blue.50" borderColor="blue.200" borderWidth="1px">
                    <CardBody>
                      <VStack spacing={4}>
                        <Heading size="md" color="blue.700" textAlign="center">📝 Información Opcional</Heading>
                        <HStack w="full" spacing={4} flexDirection={{ base: "column", md: "row" }}>
                          <FormControl>
                            <FormLabel>Nombre del Negocio</FormLabel>
                            <Input value={formData.name_business} onChange={(e) => setFormData({ ...formData, name_business: e.target.value })} placeholder="Ej: Tienda El Buen Precio" bg="white" />
                          </FormControl>

                          <FormControl>
                            <FormLabel>Barrio</FormLabel>
                            <Input value={formData.neighborhood} onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })} placeholder="Ej: Centro, La Candelaria" bg="white" />
                          </FormControl>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Button type="submit" w="full" size="xl" colorScheme="orange" isLoading={isSubmitting} loadingText="Guardando cliente..." maxW="400px">
                    💾 Guardar Cliente
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          {/* Lista de Clientes */}
          <Card>
            <CardHeader>
              <Heading size="lg" color="gray.700" textAlign="center">👥 Lista de Clientes Registrados</Heading>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Center py={8}><Spinner size="lg" /></Center>
              ) : clients.length === 0 ? (
                <VStack spacing={4} py={8}>
                  <Text fontSize="48px">👤</Text>
                  <Text fontSize="xl" color="gray.500" textAlign="center">No hay clientes registrados</Text>
                  <Text fontSize="lg" color="gray.400" textAlign="center">Agregue su primer cliente usando el formulario de arriba</Text>
                </VStack>
              ) : (
                <>
                  {isMobile ? (
                    <>
                      {/* Vista móvil: Cards */}
                      <VStack spacing={4}>
                        {clients.map((client) => (
                          <Card key={client.id} w="full" borderWidth="1px">
                            <CardBody>
                              <VStack align="start" spacing={3}>
                                <HStack justify="space-between" w="full">
                                  <Heading size="md" color="orange.600">{client.name}</Heading>

                                  {/* acciones móviles */}
                                  <HStack spacing={2}>
                                    <IconButton aria-label="Editar" icon={<EditIcon />} size="sm" onClick={() => openEditModal(client.id)} />
                                    <IconButton aria-label="Eliminar" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => openDeleteDialog(client.id)} />
                                  </HStack>
                                </HStack>

                                <VStack align="start" spacing={2} w="full">
                                  <HStack><Text fontSize="lg" fontWeight="600">📱</Text><Text fontSize="lg">{client.phone}</Text></HStack>
                                  <HStack align="start"><Text fontSize="lg" fontWeight="600">📍</Text><Text fontSize="lg">{client.address}</Text></HStack>
                                  {client.name_business && <HStack><Text fontSize="lg" fontWeight="600">🏪</Text><Text fontSize="lg">{client.name_business}</Text></HStack>}
                                  {client.neighborhood && <HStack><Text fontSize="lg" fontWeight="600">🏘️</Text><Text fontSize="lg">{client.neighborhood}</Text></HStack>}
                                </VStack>
                              </VStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>

                      {/* Paginación móvil */}
                      <HStack justify="center" spacing={4} mt={4}>
                        <Button onClick={handlePrevPage} disabled={page === 1 || loading} colorScheme="orange">Anterior</Button>
                        <Text> Página {page} de {totalPages} </Text>
                        <Button onClick={handleNextPage} disabled={page === totalPages || loading} colorScheme="orange">Siguiente</Button>
                      </HStack>
                    </>
                  ) : (
                    <>
                      {/* Vista escritorio: Tabla */}
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
                              <Th textAlign="center">Acciones</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {clients.map((client) => (
                              <Tr key={client.id}>
                                <Td fontWeight="600">{client.name}</Td>
                                <Td>
                                  <Text fontSize="sm" px={2} py={1}
                                    bg={client.type === "Premium" ? "blue.100" : "gray.100"}
                                    color={client.type === "Premium" ? "blue.700" : "gray.700"}
                                    borderRadius="md" fontWeight="600" textAlign="center"
                                  >
                                    {client.type === "Premium" ? "Premium" : "NORMAL"}
                                  </Text>
                                </Td>
                                <Td>{client.phone}</Td>
                                <Td>{client.address}</Td>
                                <Td>{client.name_business || "-"}</Td>
                                <Td>{client.neighborhood || "-"}</Td>
                                <Td>
                                  <Box display="flex" justifyContent="center">
                                    <ActionButtons id={client.id} />
                                  </Box>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>

                      {/* Paginación escritorio */}
                      <HStack justify="center" spacing={4} mt={4}>
                        <Button onClick={handlePrevPage} disabled={page === 1 || loading} colorScheme="orange">Anterior</Button>
                        <Text> Página {page} de {totalPages} </Text>
                        <Button onClick={handleNextPage} disabled={page === totalPages || loading} colorScheme="orange">Siguiente</Button>
                      </HStack>
                    </>
                  )}
                </>
              )}
            </CardBody>
          </Card>
        </VStack>

        {/* --- Edit Modal --- */}
        <Modal isOpen={isEditOpen} onClose={closeEditModal} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Cliente {editingClientId ? `#${editingClientId}` : ""}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {editLoading ? (
                <Center py={6}><Spinner /></Center>
              ) : (
                <VStack spacing={4} align="stretch">
                  {editErrors.__global && <Box color="red.600">{editErrors.__global}</Box>}

                  <FormControl isRequired isInvalid={!!editErrors.name}>
                    <FormLabel>Nombre Completo</FormLabel>
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    <FormErrorMessage>{editErrors.name}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Tipo de Cliente</FormLabel>
                    <Select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Client["type"] })}>
                      {clientTypes.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                    </Select>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!editErrors.phone}>
                    <FormLabel>Teléfono</FormLabel>
                    <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                    <FormErrorMessage>{editErrors.phone}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!editErrors.address}>
                    <FormLabel>Dirección</FormLabel>
                    <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                    <FormErrorMessage>{editErrors.address}</FormErrorMessage>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Nombre del Negocio</FormLabel>
                    <Input value={editForm.name_business ?? ""} onChange={(e) => setEditForm({ ...editForm, name_business: e.target.value })} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Barrio</FormLabel>
                    <Input value={editForm.neighborhood ?? ""} onChange={(e) => setEditForm({ ...editForm, neighborhood: e.target.value })} />
                  </FormControl>
                </VStack>
              )}
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={closeEditModal} isDisabled={editLoading}>Cancelar</Button>
              <Button colorScheme="blue" onClick={saveEdit} isLoading={editLoading}>Guardar Cambios</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* --- Delete confirmation --- */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelDeleteRef} onClose={closeDeleteDialog} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Eliminar cliente</AlertDialogHeader>
              <AlertDialogBody>¿Estás seguro de eliminar este cliente? Esta acción no se puede deshacer.</AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelDeleteRef} onClick={closeDeleteDialog} disabled={deleting}>Cancelar</Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={deleting}>Eliminar</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Layout>
    </ProtectedRoute>
  )
}
