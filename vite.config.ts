import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    allowedHosts: [
      'dorthey-complemental-also.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok-free.app',
      '.ngrok.io',
      '.trycloudflare.com',
      '192.168.1.23',
      '.local',
      'andrew-virtualbox.tailf45197.ts.net',
      'tailf45197.ts.net',
      '.ts.net',
    ],
  },
});


