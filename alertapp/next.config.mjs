/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        appDir: true,
      },
      compiler: {
        styledComponents: true,
      },
      env: {
        WS_URL: process.env.WS_URL,
        SERVER_URL: process.env.SERVER_URL,
      },
};

export default nextConfig;
