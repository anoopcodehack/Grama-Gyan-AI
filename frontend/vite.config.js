import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcsv from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcsv()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      }
    }
  }
});
