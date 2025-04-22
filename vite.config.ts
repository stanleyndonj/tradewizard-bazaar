import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: {
      clientPort: 443,
      timeout: 120000,
      protocol: 'wss',
      overlay: false
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    allowedHosts: ["all"],
    proxy: {
      '/api': {
        target: 'http://0.0.0.0:8000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://0.0.0.0:8000',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
