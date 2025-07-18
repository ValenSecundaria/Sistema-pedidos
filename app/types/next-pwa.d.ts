declare module 'next-pwa' {
  import { NextConfig } from 'next';

  type PWAOptions = {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: unknown;
    buildExcludes?: string[];
    [key: string]: unknown;
  };

  const withPWA: (options: PWAOptions) => (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
