/** @type {import('next').NextConfig} */

import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

const envFile = path.resolve(process.cwd(), '.env');
const rawEnv = dotenv.parse(fs.readFileSync(envFile));
const envVars = {
    API_HOST: 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io'
};
for (const key in rawEnv) {
    envVars[`${key}`] = rawEnv[key];
}

const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    env: envVars,
    devIndicators: false,
    // experimental: {
    //     externalDir: true,
    // },
    webpack: (config) => {
        // config.resolve.alias['@tes'] = path.resolve(
        // __dirname,
        // '../tes/'
        // );
        // config.plugins.push(new webpack.DefinePlugin(envVars));
        return config;
    }
};

export default nextConfig;
