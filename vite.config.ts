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
      host: '1c32c126-2796-4222-8b6e-a3bb9e9977b8-00-1yzbrjqgg9mxr.spock.replit.dev'
    },
    allowedHosts: ["1c32c126-2796-4222-8b6e-a3bb9e9977b8-00-1yzbrjqgg9mxr.spock.replit.dev", ".replit.dev"],
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
