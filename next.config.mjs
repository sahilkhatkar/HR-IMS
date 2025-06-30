/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false,
  // images: {
  //   domains: ["storage.googleapis.com"], // Replace with your domain
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "photos.google.com",
      },
    ],
  },
};

export default nextConfig;