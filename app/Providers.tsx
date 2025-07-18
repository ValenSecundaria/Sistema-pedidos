"use client"

import type React from "react"

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

// Tema personalizado para accesibilidad y legibilidad
const theme = extendTheme({
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  fontSizes: {
    xs: "14px",
    sm: "16px",
    md: "18px",
    lg: "20px",
    xl: "24px",
    "2xl": "28px",
  },
  colors: {
    brand: {
      50: "#e3f2fd",
      100: "#bbdefb",
      200: "#90caf9",
      300: "#64b5f6",
      400: "#42a5f5",
      500: "#2196f3",
      600: "#1e88e5",
      700: "#1976d2",
      800: "#1565c0",
      900: "#0d47a1",
    },
  },
  components: {
    Button: {
      defaultProps: {
        size: "lg",
        colorScheme: "brand",
      },
      baseStyle: {
        fontWeight: "semibold",
        borderRadius: "md",
      },
    },
    Input: {
      defaultProps: {
        size: "lg",
      },
      baseStyle: {
        field: {
          fontSize: "md",
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: "lg",
        fontWeight: "semibold",
        mb: 2,
      },
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}
