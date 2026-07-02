import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Staging/preview build only. Served as a GitHub project page under a subpath
// (https://kingdomb.github.io/dmv-queen-staging/), so it needs a matching base.
// Production is unaffected — it keeps using vite.config.js with base '/'.
export default defineConfig({
  plugins: [react()],
  base: '/dmv-queen-staging/',
});
