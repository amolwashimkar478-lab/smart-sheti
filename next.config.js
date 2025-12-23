/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/:path*',
        destination: '/:path*.html',
      },
    ];
  },
};

module.exports = nextConfig;
