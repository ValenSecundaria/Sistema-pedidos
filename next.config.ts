// next.config.ts
import withPWA from 'next-pwa'
import type { NextConfig } from 'next'

const baseConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true
})

export default pwaConfig(baseConfig)
