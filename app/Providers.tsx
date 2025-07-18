"use client"

import type React from "react"

import { ChakraProvider, extendTheme } from "@chakra-ui/react"

// Actualizar el tema de Chakra UI para mejor accesibilidad móvil

const theme = extendTheme({
  fonts: {
    heading: "system-ui, -apple-system, sans-serif",
    body: "system-ui, -apple-system, sans-serif",
  },
  fontSizes: {
    xs: "16px", // Mínimo 16px para evitar zoom en iOS
    sm: "18px",
    md: "20px",
    lg: "24px",
    xl: "28px",
    "2xl": "32px",
    "3xl": "36px",
  },
  space: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
  },
  colors: {
    brand: {
      50: "#e8f4fd",
      100: "#bee1f9",
      200: "#94cef5",
      300: "#6abbf1",
      400: "#40a8ed",
      500: "#1695e9", // Color principal más accesible
      600: "#1277ba",
      700: "#0e598b",
      800: "#0a3b5c",
      900: "#061d2e",
    },
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "12px",
        _focus: {
          boxShadow: "0 0 0 3px rgba(22, 149, 233, 0.3)",
        },
      },
      sizes: {
        sm: {
          h: "44px", // Mínimo 44px para touch
          px: "16px",
          fontSize: "16px",
        },
        md: {
          h: "52px",
          px: "20px",
          fontSize: "18px",
        },
        lg: {
          h: "60px",
          px: "24px",
          fontSize: "20px",
        },
        xl: {
          h: "68px",
          px: "32px",
          fontSize: "22px",
        },
      },
      defaultProps: {
        size: "lg",
        colorScheme: "brand",
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "12px",
          _focus: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 3px rgba(22, 149, 233, 0.1)",
          },
        },
      },
      sizes: {
        md: {
          field: {
            h: "52px",
            px: "16px",
            fontSize: "18px",
          },
        },
        lg: {
          field: {
            h: "60px",
            px: "20px",
            fontSize: "20px",
          },
        },
      },
      defaultProps: {
        size: "lg",
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "12px",
          _focus: {
            borderColor: "brand.500",
            boxShadow: "0 0 0 3px rgba(22, 149, 233, 0.1)",
          },
        },
      },
      sizes: {
        lg: {
          field: {
            h: "60px",
            px: "20px",
            fontSize: "20px",
          },
        },
      },
      defaultProps: {
        size: "lg",
      },
    },
    FormLabel: {
      baseStyle: {
        fontSize: "20px",
        fontWeight: "600",
        mb: "8px",
        color: "gray.700",
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: "16px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
      },
    },
    Table: {
      sizes: {
        lg: {
          th: {
            px: "16px",
            py: "16px",
            fontSize: "18px",
            fontWeight: "600",
          },
          td: {
            px: "16px",
            py: "16px",
            fontSize: "18px",
          },
        },
      },
      defaultProps: {
        size: "lg",
      },
    },
  },
  breakpoints: {
    base: "0px",
    sm: "480px",
    md: "768px",
    lg: "992px",
    xl: "1280px",
    "2xl": "1536px",
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}
