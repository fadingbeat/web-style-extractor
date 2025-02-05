/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // ✅ This ensures Puppeteer dependencies are bundled
};

export default nextConfig;
