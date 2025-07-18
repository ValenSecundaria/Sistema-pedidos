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
} from "@chakra-ui/react"
import { Layout } from "../components/layout"
import { ProtectedRoute } from "../components/ProtectedRoute"
import type { Client } from "../types"

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    name: "",
    type: "normal" as Client["type"],
    phone: "",
    address: "",
    name_business: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
    }

    // Stub de guardado
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    })

    setClients([...clients, newClient])
    setFormData({
      name: "",
      type: "normal",
      phone: "",
      address: "",
      name_business: "",
    })
  }

  return (
    <ProtectedRoute>
      <Layout title="Clientes">
        <VStack spacing={6} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md">Agregar Nuevo Cliente</Heading>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <HStack w="full">
                    <FormControl isRequired>
                      <FormLabel>Nombre</FormLabel>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Tipo</FormLabel>
                      <Select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as Client["type"] })}
                      >
                        <option value="normal">Normal</option>
                        <option value="premium">Premium</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <HStack w="full">
                    <FormControl>
                      <FormLabel>Teléfono</FormLabel>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Nombre del Negocio</FormLabel>
                      <Input
                        value={formData.name_business}
                        onChange={(e) => setFormData({ ...formData, name_business: e.target.value })}
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Dirección</FormLabel>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </FormControl>

                  <Button type="submit" w="full">
                    Agregar Cliente
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </Card>

          <TableContainer>
            <Table variant="simple" size="lg">
              <Thead>
                <Tr>
                  <Th fontSize="md">Nombre</Th>
                  <Th fontSize="md">Tipo</Th>
                  <Th fontSize="md">Teléfono</Th>
                  <Th fontSize="md">Negocio</Th>
                </Tr>
              </Thead>
              <Tbody>
                {clients.map((client) => (
                  <Tr key={client.id}>
                    <Td fontSize="md">{client.name}</Td>
                    <Td fontSize="md">{client.type}</Td>
                    <Td fontSize="md">{client.phone || "-"}</Td>
                    <Td fontSize="md">{client.name_business || "-"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </VStack>
      </Layout>
    </ProtectedRoute>
  )
}
