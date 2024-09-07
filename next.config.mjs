/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (
        config
      ) => {
        // Important: return the modified config
        return { 
            ...config, 
            externals: ['chrome-aws-lambda'],
        }
    },
}

export default nextConfig;
