/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/consumer/out',
  output: 'export',
  // This consumer app lives inside the Vitessce monorepo, so Next.js detects
  // multiple lockfiles (the monorepo's pnpm-lock.yaml and this dir's
  // package-lock.json) and infers the monorepo as the workspace root. Pin the
  // root to this directory.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
