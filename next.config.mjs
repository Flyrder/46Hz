/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": [
      "node_modules/@prisma/composer/**",
      "node_modules/@prisma/composer-cli/**",
      "node_modules/@prisma/studio-core/**",
      "node_modules/@prisma/engines/**",
      "node_modules/prisma/**",
      "node_modules/workerd/**",
      "node_modules/@alchemy.run/**",
      "node_modules/.prisma/**",
      "node_modules/.cache/**"
    ]
  },
  turbopack: {
    root: process.cwd()
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none';"
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
