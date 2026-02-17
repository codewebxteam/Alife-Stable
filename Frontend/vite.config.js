import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Host: true karne se Vite local network (IP) par expose ho jata hai
    host: true, 
    // 2. allowedHosts: "all" karne se Browser *.localhost requests ko Vite tak pahunchne deta hai
    // Ye aapke MacBook par subdomain testing ke liye sabse zaroori line hai
    allowedHosts: "all", 
    port: 5173,
    strictPort: true,
  }
})