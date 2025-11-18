/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["localhost", "localhost:1337"],
    // remotePatterns: [
    //   {
    //     protocol: "http",
    //     hostname: "localhost",
    //     port: "1337",
    //     pathname: "/uploads/**",
    //   },
    // ],
  },
};

export default nextConfig;
