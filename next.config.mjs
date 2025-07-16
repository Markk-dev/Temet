const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fra.cloud.appwrite.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'syd.cloud.appwrite.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
