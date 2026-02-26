import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from 'dns'

// Fix Node.js ENOTFOUND proxy errors (forces IPv4 DNS resolution over IPv6)
dns.setDefaultResultOrder('ipv4first')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/jup-api': {
        target: 'https://lite-api.jup.ag',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/jup-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            proxyReq.setHeader('Origin', 'https://jup.ag');
            proxyReq.setHeader('Referer', 'https://jup.ag/');
          });
        }
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'solana-web3': ['@solana/web3.js'],
          'solana-wallet': ['@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui', '@solana/wallet-adapter-wallets', '@solana/wallet-adapter-base'],
          'gemini': ['@google/generative-ai'],
          'lucide': ['lucide-react']
        }
      }
    }
  }
})
