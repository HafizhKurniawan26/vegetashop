/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jolly-novelty-db69ffff34.strapiapp.com",
      },
      {
        protocol: "https",
        hostname: "jolly-novelty-db69ffff34.media.strapiapp.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "retrogressive-subtriplicate-dawn.ngrok-free.dev",
        port: "",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "vegetashop.web.id",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
