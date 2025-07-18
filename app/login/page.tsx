"use client"

import type React from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

import { useState } from "react"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Center,
} from "@chakra-ui/react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError("Email o contraseña incorrectos")
    } else {
      router.push("/dashboard")
    }

    setLoading(false)
  }

  return (
    <Center minH="100vh" bg="gray.50" p={4}>
      <Card maxW="md" w="full">
        <CardBody>
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center" color="brand.700">
              Iniciar Sesión
            </Heading>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            <Box as="form" onSubmit={handleSubmit} w="full">
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingrese su email"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Contraseña</FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingrese su contraseña"
                  />
                </FormControl>

                <Button type="submit" w="full" isLoading={loading} loadingText="Ingresando...">
                  Ingresar
                </Button>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Center>
  )
}
