"use client"

import React, { useState, useEffect } from "react"
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
  useToast,
} from "@chakra-ui/react"

import { ProtectedRoute } from "../components/ProtectedRoute"
import { Layout } from "../components/layout"
import type { Product, Category, RawProduct } from "../types"

type ProductForm = {
  nombre: string
  descripcion?: string
  unidad_medida?: string
  categoria_id?: number | null
  stock?: number | null
  precio_unitario: number
}

export default function ProductsPage(): JSX.Element {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)

  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure()
  const [addForm, setAddForm] = useState<ProductForm>({
    nombre: "",
    descripcion: "",
    unidad_medida: "",
    categoria_id: null,
    stock: null,
    precio_unitario: 0,
  })

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ProductForm>({
    nombre: "",
    descripcion: "",
    unidad_medida: "",
    categoria_id: null,
    stock: null,
    precio_unitario: 0,
  })
  const [editLoading, setEditLoading] = useState(false)

  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const validateProductForm = (f: ProductForm): string | null => {
    if (!f.nombre || !String(f.nombre).trim()) return "El nombre del producto es obligatorio"
    if (!Number.isFinite(Number(f.precio_unitario))) return "El precio debe ser un número válido"
    if (Number(f.precio_unitario) < 0) return "El precio no puede ser negativo"
    if (f.categoria_id == null) return "La categoría es obligatoria"
    return null
  }

  const fetchProducts = async (pageNum = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?page=${pageNum}&limit=10`)
      if (!res.ok) throw new Error("Error al obtener productos")
      const data: { productos: RawProduct[]; totalPages: number; page: number } = await res.json()
      const transformed: Product[] = data.productos.map(p => ({
        id: String(p.id),
        name: p.name,
        description: p.description ?? "",
        category: p.category ?? "",
        priceNormal: typeof p.priceNormal === "number" ? p.priceNormal : 0,
        pricePremium: 0,
        saleType: "",
      }))
      setProducts(transformed)
      setTotalPages(data.totalPages)
      setPage(data.page)
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "No se pudieron cargar productos", status: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(page)
    ;(async () => {
      try {
        const rcat = await fetch("/api/categories")
        if (rcat.ok) setCategories(await rcat.json())
      } catch (e) {
        console.error("Error cargando categorías:", e)
      }
    })()
  }, [page])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const err = validateProductForm(addForm)
    if (err) {
      toast({ title: "Formulario inválido", description: err, status: "warning" })
      return
    }
    try {
      const payload = { ...addForm }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "Error creando producto")
        throw new Error(txt || "No se pudo crear producto")
      }

      toast({ title: "Creado", description: "Producto creado correctamente", status: "success" })
      onAddClose()
      setAddForm({ nombre: "", descripcion: "", unidad_medida: "", categoria_id: null, stock: null, precio_unitario: 0 })
      await fetchProducts(1)
      setPage(1)
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: (err as Error).message || "No se pudo crear el producto", status: "error" })
    }
  }

  const openEditModal = async (id: string) => {
    setEditingId(id)
    setEditLoading(true)
    onEditOpen()
    try {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error("No se pudo obtener producto")
      const data = await res.json()
      setEditForm({
        nombre: data.nombre ?? "",
        descripcion: data.descripcion ?? "",
        unidad_medida: data.unidad_medida ?? "",
        categoria_id: data.categoria_id ?? null,
        stock: data.stock ?? null,
        precio_unitario: Number.isFinite(Number(data.precio_unitario)) ? Number(data.precio_unitario) : 0,
      })
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: "No se pudo cargar el producto", status: "error" })
      onEditClose()
    } finally {
      setEditLoading(false)
    }
  }

  const saveEdit = async () => {
    if (!editingId) return

    const err = validateProductForm(editForm)
    if (err) {
      toast({ title: "Fo rmulario inválido", description: err, status: "warning" })
      return
    }

    setEditLoading(true)
    try {
      const payload = { ...editForm }
      const res = await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const txt = await res.text().catch(() => "Error al actualizar")
        throw new Error(txt || "Error al actualizar")
      }
      toast({ title: "Guardado", description: "Producto actualizado", status: "success" })
      onEditClose()
      setEditingId(null)
      await fetchProducts(page)
    } catch (err) {
      console.error(err)
      toast({ title: "Error", description: (err as Error).message || "Error al guardar", status: "error" })
    } finally {
      setEditLoading(false)
    }
  }


 const tableSize: "sm" | "lg" | undefined = useBreakpointValue({ base: "sm", md: "lg" });
 const actionSize: "xs" | "sm" | undefined = useBreakpointValue({ base: "xs", md: "sm" });


  return (
    <ProtectedRoute>
      <Layout title="Productos">
        <VStack spacing={6} align="stretch">
          <Button onClick={onAddOpen} size="xl" colorScheme="green" h="70px" fontSize="20px">
            ➕ Agregar Nuevo Producto
          </Button>

          {loading ? (
            <Center py={20}><Spinner size="xl" /></Center>
          ) : isMobile ? (
            <VStack spacing={4}>
              {products.length === 0 ? (
                <Card w="full"><CardBody textAlign="center" py={12}><Text fontSize="xl" color="gray.500">No hay productos registrados</Text></CardBody></Card>
              ) : (
                products.map(prod => (
                  <Card key={prod.id}><CardBody>
                    <VStack align="start" spacing={3}>
                      <Heading size="md">{prod.name}</Heading>
                      <Text><strong>Categoría:</strong> {prod.category}</Text>
                      <Text color="green.600"><strong>Precio:</strong> ${prod.priceNormal.toFixed(2)}</Text>
                      <HStack>
                        <Button size={actionSize} onClick={() => openEditModal(prod.id)}>Modificar</Button>
                      </HStack>
                    </VStack>
                  </CardBody></Card>
                ))
              )}
            </VStack>
          ) : (
            <Card>
              <CardBody>
                <TableContainer>
                  <Table variant="simple" size={tableSize}>
                    <Thead bg="gray.50">
                      <Tr>
                        <Th>Nombre</Th>
                        <Th>Categoría</Th>
                        <Th isNumeric>Precio Unitario</Th>
                        <Th textAlign="center">Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {products.map(prod => (
                        <Tr key={prod.id}>
                          <Td>{prod.name}</Td>
                          <Td>{prod.category}</Td>
                          <Td isNumeric>${prod.priceNormal.toFixed(2)}</Td>
                          <Td>
                            <HStack justify="center">
                              <Button size={actionSize} onClick={() => openEditModal(prod.id)}>Modificar</Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          )}

          {/* Pagination */}
          <HStack justify="center">
            <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
            <Text>Página {page} de {totalPages}</Text>
            <Button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Siguiente</Button>
          </HStack>

          {/* ADD Modal */}
          <Modal isOpen={isAddOpen} onClose={onAddClose} size={{ base: "full", md: "xl" }}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Agregar Nuevo Producto</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={8}>
                <form onSubmit={handleAddSubmit}>
                  <VStack spacing={4}>
                    <FormControl isRequired><FormLabel>Nombre</FormLabel><Input value={addForm.nombre} onChange={e => setAddForm({...addForm, nombre: e.target.value})} /></FormControl>
                    <FormControl><FormLabel>Descripción</FormLabel><Textarea value={addForm.descripcion} onChange={e => setAddForm({...addForm, descripcion: e.target.value})} /></FormControl>
                    <FormControl isRequired><FormLabel>Categoría</FormLabel><Select placeholder="Seleccionar" value={addForm.categoria_id ? String(addForm.categoria_id) : ""} onChange={e => setAddForm({...addForm, categoria_id: e.target.value ? Number(e.target.value) : null})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </Select></FormControl>
                    <FormControl isRequired><FormLabel>Precio</FormLabel><NumberInput min={0} precision={2} value={addForm.precio_unitario ?? 0} onChange={(_, val) => setAddForm({...addForm, precio_unitario: val})}><NumberInputField /></NumberInput></FormControl>

                    <HStack w="full">
                      <Button type="submit" colorScheme="green" flex={1}>Guardar</Button>
                      <Button variant="outline" onClick={onAddClose} flex={1}>Cancelar</Button>
                    </HStack>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* EDIT Modal */}
          <Modal isOpen={isEditOpen} onClose={() => { onEditClose(); setEditingId(null) }} size={{ base: "full", md: "xl" }}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modificar Producto {editingId ? `#${editingId}` : ""}</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={8}>
                <VStack spacing={4}>
                  <FormControl isRequired><FormLabel>Nombre</FormLabel><Input value={editForm.nombre} onChange={e => setEditForm({...editForm, nombre: e.target.value})} /></FormControl>
                  <FormControl><FormLabel>Descripción</FormLabel><Textarea value={editForm.descripcion} onChange={e => setEditForm({...editForm, descripcion: e.target.value})} /></FormControl>
                  <FormControl isRequired><FormLabel>Categoría</FormLabel><Select placeholder="Seleccionar" value={editForm.categoria_id ? String(editForm.categoria_id) : ""} onChange={e => setEditForm({...editForm, categoria_id: e.target.value ? Number(e.target.value) : null})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </Select></FormControl>
                  <FormControl isRequired><FormLabel>Precio</FormLabel><NumberInput min={0} precision={2} value={editForm.precio_unitario ?? 0} onChange={(_, val) => setEditForm({...editForm, precio_unitario: val})}><NumberInputField /></NumberInput></FormControl>

                  <HStack w="full">
                    <Button colorScheme="blue" isLoading={editLoading} onClick={saveEdit}>Guardar Cambios</Button>
                    <Button variant="ghost" onClick={() => { onEditClose(); setEditingId(null) }}>Cancelar</Button>
                  </HStack>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
