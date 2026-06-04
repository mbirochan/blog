/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Keep image output compatible with static hosts that do not run Next's image optimizer.
    unoptimized: true,
  },
}

export default nextConfig
