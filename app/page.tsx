"use client";

import { VStack, Text, Button, SimpleGrid, Card, CardBody, CardHeader, Heading } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout";

export default function HomePage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <Layout title="Bienvenido">
        <VStack spacing={8} align="stretch">
          <Text fontSize="xl" textAlign="center" color="gray.600">
            Bienvenido al sistema de gestión. Seleccione una opción para comenzar.
          </Text>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card>
              <CardHeader>
                <Heading size="md">Productos</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>Gestionar catálogo de productos</Text>
                <Button w="full" onClick={() => router.push("/products")}>
                  Ver Productos
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Clientes</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>Administrar base de clientes</Text>
                <Button w="full" onClick={() => router.push("/clients")}>
                  Ver Clientes
                </Button>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Pedidos</Heading>
              </CardHeader>
              <CardBody>
                <Text mb={4}>Crear y gestionar pedidos</Text>
                <Button w="full" onClick={() => router.push("/orders/new")}>
                  Nuevo Pedido
                </Button>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Button size="xl" colorScheme="green" onClick={() => router.push("/orders/new")} py={8} fontSize="xl">
            Ir a Pedidos
          </Button>
        </VStack>
      </Layout>
    </ProtectedRoute>
  );
}
