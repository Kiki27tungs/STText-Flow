/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure we don't leak server secrets to client, 
  // though we are explicitly using NEXT_PUBLIC_ for the client service.
  env: {
    // Maps system env to client if needed, but NEXT_PUBLIC_ does this auto.
    API_KEY: process.env.API_KEY,
  }
};

export default nextConfig;