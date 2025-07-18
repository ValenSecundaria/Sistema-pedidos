'use client';

import { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ChakraProvider>
          <SessionProvider>
            {children}
            </SessionProvider>
        </ChakraProvider>
      </body>
    </html>
  );
}
