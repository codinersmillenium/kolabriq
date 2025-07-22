/** @type {import('next').NextConfig} */

import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

const envFile = path.resolve(process.cwd(), '.env');
const rawEnv = dotenv.parse(fs.readFileSync(envFile));
const envVars = {
    API_HOST: 'http://127.0.0.1:4943'
};
for (const key in rawEnv) {
    envVars[`${key}`] = rawEnv[key];
}

const nextConfig = {
    env: envVars,
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
