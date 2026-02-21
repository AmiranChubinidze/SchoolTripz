/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      // Cloudinary — production image uploads
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Local dev uploads
      { protocol: 'http', hostname: 'localhost', port: '3001', pathname: '/uploads/**' },
    ],
  },
}

export default nextConfig
