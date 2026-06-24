import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: { port: 3000, open: true },
  preview: {
    host: true,
    strictPort: false,
    // Respect Railway's PORT when provided
    port: Number(process.env.PORT) || 4173,
    // Allow Railway-provided domain(s)
    // Tip: keep the exact domain and a wildcard suffix for redeploys
    allowedHosts: [
      "gridlock-game-production-e53b.up.railway.app",
      ".up.railway.app"
    ]
  }
})
