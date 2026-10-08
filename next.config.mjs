/** @type {import('next').NextConfig} */
const nextConfig = {
  // El mapa de "exports" de tslib apunta a un .mjs que no siempre existe, lo que
  // hace fallar la resolución en Turbopack. Forzamos su resolución al ESM real.
  turbopack: {
    resolveAlias: {
      tslib: 'tslib/tslib.es6.js',
    },
  },
}

export default nextConfig
