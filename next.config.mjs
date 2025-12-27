// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   async headers() {
//     return [
//       {
//         source: "/api/(.*)",
//         headers: [
//           {
//             key: "Access-Control-Allow-Origin",
//             value: "*",
//           },
//           {
//             key: "Access-Control-Allow-Methods",
//             value: "GET, POST, PUT, DELETE, OPTIONS",
//           },
//           {
//             key: "Access-Control-Allow-Headers",
//             value: "Content-Type, Authorization",
//           },
//           {
//             key: "Content-Range",
//             value: "bytes : 0-9/*",
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;

import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Content-Range",
            value: "bytes : 0-9/*",
          },
        ],
      },
    ];
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
