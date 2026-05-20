import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({command}) => {
    return {
        plugins: [react()],
        build: {
            outDir: 'build',
        },
        server: {
            proxy: command === 'serve' ? {
                '/api/v1': {
                    target: 'http://localhost:5000/',
                    changeOrigin: true,

                }
            } : {}
        },
    }
});