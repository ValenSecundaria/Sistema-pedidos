'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import {
  VStack,
  HStack,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Spinner,
  Center,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  IconButton,
  Box,
  Flex,
  Divider,
  Select,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  useBreakpointValue,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { useRouter } from 'next/navigation'
import { Layout } from '../components/layout'
import { ProtectedRoute } from '../components/ProtectedRoute'

// Tipados locales (alineados con tus interfaces suministradas)
interface RawProduct {
  id: number | string
  name: string
  description?: string | null
  category?: string | null
  priceNormal: number
}

type ProductOpt = { id: number; nombre: string }

type Order = {
  id: string
  clientId: string
  dateCreated: string
  total: number
  estadoPedidoId: number
  estadoPedidoName: string
  clientName?: string
}

type OrderDetailForm = {
  id?: number | null
  productoId: number | ''
  productoNombre?: string
  cantidad: string
  listaPrecioId: number | ''
  precioUnitario: string
}

// Tipos para respuestas de API
type ProductsApiResponse = { productos?: RawProduct[]; page?: number; totalPages?: number }
type OrderDetailApi = {
  id: number
  producto_id: number
  producto?: { nombre?: string } | null
  producto_name?: string | null
  cantidad: string | number
  lista_precio_id: number
  precio_unitario: string | number
}
type OrderUpdateApiResponse = {
  id: string
  cliente_id: number
  fecha: string
  observaciones?: string | null
  detalle_pedido: OrderDetailApi[]
}

// Respuesta cliente-nombre
type ClientNameResp = { id: string; name: string }

export default function OrdersPage(): JSX.Element {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // products for select
  const [products, setProducts] = useState<ProductOpt[]>([])
  const [productsLoading, setProductsLoading] = useState(false)

  // edit modal
  const [isOpen, setIsOpen] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [clienteId, setClienteId] = useState<string>('')
  const [clientName, setClientName] = useState<string>('')
  const [clientNameLoading, setClientNameLoading] = useState<boolean>(false)
  const [fecha, setFecha] = useState<string>('')
  const [observaciones, setObservaciones] = useState<string>('')
  const [details, setDetails] = useState<OrderDetailForm[]>([])
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // delete confirmation
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  // responsive table size and button size
  const tableSize = useBreakpointValue<'sm' | 'md' | 'lg'>({ base: 'sm', md: 'lg', lg: 'lg' })
  const actionBtnSize = (useBreakpointValue({ base: 'xs', md: 'sm' }) ?? 'sm') as 'xs' | 'sm'

  // Helper: formato fecha
  const formatDate = (d: string) =>
    new Date(d).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  // Cargar pedidos y resolver nombres por cliente
  const loadOrders = async (): Promise<void> => {
    setLoading(true)
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) throw new Error('Error cargando pedidos')
      const data = (await res.json()) as Order[]

      // obtener clientIds únicos
      const uniqueClientIds = Array.from(new Set(data.map((o) => o.clientId).filter(Boolean)))

      // cache local para nombres
      const nameMap: Record<string, string> = {}

      // parallel requests para nombres (cada id -> /api/clients/client-name/:id)
      await Promise.all(
        uniqueClientIds.map(async (id) => {
          try {
            const r = await fetch(`/api/clients/client-name/${id}`)
            if (!r.ok) {
              nameMap[id] = `Cliente #${id}`
              return
            }
            const body = (await r.json()) as ClientNameResp
            nameMap[id] = body?.name ?? `Cliente #${id}`
          } catch (e) {
            nameMap[id] = `Cliente #${id}`
          }
        })
      )

      const mapped = data.map((o) => ({ ...o, clientName: nameMap[o.clientId] ?? `Cliente #${o.clientId}` }))
      setOrders(mapped)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  // cargar productos para selects
  const loadProducts = async (): Promise<void> => {
    setProductsLoading(true)
    try {
      const perPage = 100
      let page = 1
      const all: ProductOpt[] = []
      while (true) {
        const res = await fetch(`/api/products?page=${page}&limit=${perPage}`)
        if (!res.ok) throw new Error('No se pudieron cargar productos')
        const body = (await res.json()) as ProductsApiResponse
        const items = (body.productos ?? []).map((p) => ({ id: Number(p.id), nombre: p.name }))
        all.push(...items)
        const totalPages = typeof body.totalPages === 'number' ? body.totalPages : 1
        if (page >= totalPages) break
        page += 1
      }
      all.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
      setProducts(all)
    } catch (e) {
      console.error('Error cargando productos:', e)
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const badgeColor = (id: number) => (id === 1 ? 'yellow' : id === 2 ? 'green' : 'red')

  // obtener nombre de cliente para modal de edición (single)
  const fetchClientName = async (id: string) => {
    if (!id) {
      setClientName('')
      return
    }
    setClientNameLoading(true)
    try {
      const res = await fetch(`/api/clients/client-name/${id}`)
      if (!res.ok) {
        setClientName(`Cliente #${id}`)
        return
      }
      const body = (await res.json()) as ClientNameResp
      setClientName(body?.name ?? `Cliente #${id}`)
    } catch (e) {
      console.error('Error fetching client name:', e)
      setClientName(`Cliente #${id}`)
    } finally {
      setClientNameLoading(false)
    }
  }

  // abrir modal para editar pedido
  const openEditModal = async (orderId: string): Promise<void> => {
    setFormError(null)
    setSaving(false)
    setEditingOrderId(orderId)
    setIsOpen(true)
    setClientName('')
    try {
      const res = await fetch(`/api/orders/update/${orderId}`)
      if (!res.ok) throw new Error('No se pudo obtener los datos completos del pedido')
      const data = (await res.json()) as OrderUpdateApiResponse

      const clienteVal = data.cliente_id ?? undefined
      setClienteId(String(clienteVal ?? ''))

      if (clienteVal != null) {
        await fetchClientName(String(clienteVal))
      } else {
        setClientName('')
      }

      const fechaVal = data.fecha ?? undefined
      if (fechaVal) {
        const d = new Date(fechaVal)
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        setFecha(local.toISOString().slice(0, 16))
      } else setFecha('')

      setObservaciones(data.observaciones ?? '')

      const rawDetails = data.detalle_pedido ?? []
      const mappedDetails: OrderDetailForm[] = rawDetails.map((r) => ({
        id: r.id,
        productoId: Number(r.producto_id),
        productoNombre: (r.producto?.nombre ?? r.producto_name ?? '') as string,
        cantidad: String(r.cantidad ?? '0'),
        listaPrecioId: Number(r.lista_precio_id),
        precioUnitario: String(r.precio_unitario ?? '0'),
      }))

      setDetails(mappedDetails.length ? mappedDetails : [{ productoId: '', cantidad: '1', listaPrecioId: '', precioUnitario: '0' }])
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error desconocido al cargar pedido')
    }
  }

  const closeModal = (): void => {
    setIsOpen(false)
    setEditingOrderId(null)
    setClienteId('')
    setClientName('')
    setClientNameLoading(false)
    setFecha('')
    setObservaciones('')
    setDetails([])
    setFormError(null)
  }

  const updateDetailField = (idx: number, field: keyof OrderDetailForm, value: OrderDetailForm[keyof OrderDetailForm]): void => {
    setDetails((prev) => prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)))
  }

  const addDetailRow = (): void => setDetails((prev) => [...prev, { productoId: '', cantidad: '1', listaPrecioId: '', precioUnitario: '0' }])
  const removeDetailRow = (idx: number): void => setDetails((prev) => prev.filter((_, i) => i !== idx))

  const validateForm = (): string | null => {
    if (!clienteId.trim()) return 'El campo cliente es obligatorio'
    if (details.length === 0) return 'Debe haber al menos un detalle en el pedido'
    for (const [i, d] of details.entries()) {
      if (d.productoId === '' || d.productoId === null || typeof d.productoId === 'undefined') return `Detalle ${i + 1}: producto requerido`
      if (d.listaPrecioId === '' || d.listaPrecioId === null || typeof d.listaPrecioId === 'undefined') return `Detalle ${i + 1}: lista de precio requerida`
      if (!d.precioUnitario || Number(d.precioUnitario) <= 0) return `Detalle ${i + 1}: precio unitario inválido`
      if (!d.cantidad || Number(d.cantidad) <= 0) return `Detalle ${i + 1}: cantidad inválida`
    }
    return null
  }

  const saveChanges = async (): Promise<void> => {
    const err = validateForm()
    if (err) {
      setFormError(err)
      return
    }
    if (!editingOrderId) return
    setSaving(true)
    setFormError(null)
    const payload = {
      cliente_id: Number(clienteId),
      fecha: fecha ? new Date(fecha).toISOString() : undefined,
      observaciones: observaciones || null,
      detalle_pedido: details.map((d) => ({
        id: d.id ?? undefined,
        producto_id: Number(d.productoId),
        cantidad: d.cantidad,
        lista_precio_id: Number(d.listaPrecioId),
        precio_unitario: d.precioUnitario,
      })),
    }

    try {
      const res = await fetch(`/api/orders/${editingOrderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errMsg = 'Error guardando cambios'
        try {
          const body = (await res.clone().json()) as Record<string, unknown>
          if (body) errMsg = String((body['error'] ?? body['message']) ?? JSON.stringify(body))
        } catch {
          try {
            const txt = await res.clone().text()
            if (txt) errMsg = txt
          } catch {
            /* noop */
          }
        }
        throw new Error(errMsg)
      }

      await loadOrders()
      closeModal()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : 'Error desconocido al guardar')
    } finally {
      setSaving(false)
    }
  }

  // eliminar pedido: abrir confirm dialog
  const openDeleteConfirm = (orderId: string): void => {
    setDeletingOrderId(orderId)
    setIsDeleteOpen(true)
  }
  const cancelDelete = (): void => {
    setIsDeleteOpen(false)
    setDeletingOrderId(null)
  }

  const confirmDelete = async (): Promise<void> => {
    if (!deletingOrderId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/orders/${deletingOrderId}`, { method: 'DELETE' })
      if (!res.ok) {
        let errMsg = 'Error eliminando pedido'
        try {
          const body = (await res.clone().json()) as Record<string, unknown> | null
          if (body) errMsg = String((body['error'] ?? body['message']) ?? JSON.stringify(body))
        } catch {
          try {
            const txt = await res.clone().text()
            if (txt) errMsg = txt
          } catch {
            /* noop */
          }
        }
        throw new Error(errMsg)
      }
      await loadOrders()
      setIsDeleteOpen(false)
      setDeletingOrderId(null)
    } catch (e: unknown) {
      console.error(e)
      setFormError(e instanceof Error ? e.message : 'Error eliminando pedido')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Pedidos">
        <Center py={20}>
          <Spinner size="xl" />
        </Center>
      </Layout>
    )
  }
  if (error) {
    return (
      <Layout title="Pedidos">
        <Center py={20}>
          <Text color="red.500">Error: {error}</Text>
        </Center>
      </Layout>
    )
  }

  return (
    <ProtectedRoute>
      <Layout title="Pedidos">
        <VStack spacing={6} align="stretch">
          <HStack>
            <Button size={actionBtnSize} colorScheme="green" onClick={() => router.push('/orders/new')}>
              + Nuevo Pedido
            </Button>
          </HStack>

          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size={tableSize}>
                <Thead>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Cliente</Th>
                    <Th>Fecha</Th>
                    <Th>Total</Th>
                    <Th>Estado</Th>
                    <Th isNumeric={false} textAlign="center">
                      Acciones
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orders.map((o) => (
                    <Tr key={o.id}>
                      <Td>#{o.id.slice(-6)}</Td>
                      <Td>{o.clientName ?? `Cliente #${o.clientId}`}</Td>
                      <Td>{formatDate(o.dateCreated)}</Td>
                      <Td>${o.total.toFixed(2)}</Td>
                      <Td>
                        <Button size={actionBtnSize} colorScheme={badgeColor(o.estadoPedidoId)} isDisabled>
                          {o.estadoPedidoName}
                        </Button>
                      </Td>
                      <Td>
                        <Flex justify="center">
                          <HStack spacing={2}>
                            <Button size={actionBtnSize} onClick={() => window.open(`/orders/${o.id}/print`, '_blank')}>
                              Imprimir
                            </Button>
                            <Button size={actionBtnSize} onClick={() => openEditModal(o.id)}>
                              Modificar
                            </Button>
                            <Button size={actionBtnSize} colorScheme="red" onClick={() => openDeleteConfirm(o.id)}>
                              Eliminar
                            </Button>
                          </HStack>
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          {orders.length === 0 && (
            <Center py={10} flexDir="column">
              <Text>No hay pedidos registrados</Text>
              <Button mt={4} size={actionBtnSize} colorScheme="green" onClick={() => router.push('/orders/new')}>
                Crear Primer Pedido
              </Button>
            </Center>
          )}
        </VStack>

        {/* Edit modal (igual que tenías) */}
        <Modal isOpen={isOpen} onClose={closeModal} size="6xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Modificar Pedido {editingOrderId ? `#${editingOrderId.slice(-6)}` : ''}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {formError && (
                <Box mb={4} color="red.600">
                  {formError}
                </Box>
              )}

              <VStack align="stretch" spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Cliente</FormLabel>
                  <Input value={clientNameLoading ? 'Cargando...' : clientName || clienteId} isDisabled={saving} readOnly />
                </FormControl>

                <FormControl>
                  <FormLabel>Fecha</FormLabel>
                  <Input type="datetime-local" value={fecha} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFecha(e.target.value)} isDisabled={saving} />
                </FormControl>

                <FormControl>
                  <FormLabel>Observaciones</FormLabel>
                  <Textarea value={observaciones} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObservaciones(e.target.value)} isDisabled={saving} />
                </FormControl>

                <Divider />

                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium">Detalle del Pedido</Text>
                  <IconButton aria-label="Agregar" icon={<AddIcon />} onClick={addDetailRow} size="sm" isDisabled={saving} />
                </Flex>

                <Box overflowX="auto">
                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>#</Th>
                          <Th>Producto</Th>
                          <Th>Cantidad</Th>
                          <Th>Lista Precio</Th>
                          <Th>Precio Unitario</Th>
                          <Th>Subtotal</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {details.map((d, i) => (
                          <Tr key={i}>
                            <Td>{i + 1}</Td>
                            <Td>
                              <Select
                                placeholder={productsLoading ? 'Cargando productos...' : '-- seleccionar producto --'}
                                value={d.productoId !== '' ? String(d.productoId) : ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                  const id = e.target.value ? Number(e.target.value) : ''
                                  const prod = products.find((p) => p.id === id)
                                  updateDetailField(i, 'productoId', id as number | '')
                                  updateDetailField(i, 'productoNombre', prod?.nombre ?? '')
                                }}
                                isDisabled={saving || productsLoading}
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.nombre}
                                  </option>
                                ))}
                              </Select>
                            </Td>

                            <Td>
                              <NumberInput min={0.01} precision={2} value={d.cantidad} onChange={(_, val) => updateDetailField(i, 'cantidad', String(val))}>
                                <NumberInputField />
                              </NumberInput>
                            </Td>

                            <Td>
                              <Select
                                placeholder="-- seleccionar --"
                                value={d.listaPrecioId !== '' ? String(d.listaPrecioId) : ''}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateDetailField(i, 'listaPrecioId', e.target.value ? Number(e.target.value) : '')}
                                isDisabled={saving}
                              >
                                <option value={1}>Caja cerrada</option>
                                <option value={2}>Caja abierta</option>
                              </Select>
                            </Td>

                            <Td>
                              <NumberInput min={0} precision={2} value={d.precioUnitario} onChange={(_, val) => updateDetailField(i, 'precioUnitario', String(val))}>
                                <NumberInputField />
                              </NumberInput>
                            </Td>

                            <Td>
                              {(() => {
                                const c = Number(d.cantidad || 0)
                                const p = Number(d.precioUnitario || 0)
                                return isNaN(c) || isNaN(p) ? '0.00' : `$${(c * p).toFixed(2)}`
                              })()}
                            </Td>

                            <Td>
                              <IconButton aria-label="Eliminar" icon={<DeleteIcon />} onClick={() => removeDetailRow(i)} size="sm" isDisabled={saving} />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={closeModal} disabled={saving}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={saveChanges} isLoading={saving}>
                Guardar Cambios
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete confirmation */}
        <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={cancelDelete} isCentered>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">Eliminar pedido</AlertDialogHeader>

              <AlertDialogBody>¿Estás seguro de eliminar este pedido? Esta acción no se puede deshacer.</AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={cancelDelete} disabled={deleting}>Cancelar</Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3} isLoading={deleting}>Eliminar</Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Layout>
    </ProtectedRoute>
  )
}
