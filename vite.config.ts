import { defineConfig } from 'vite'

// Slidev 52's bundled code-block CSS has a rule lightningcss (the default CSS
// minifier on rolldown-vite) refuses to parse. esbuild minifies it fine.
export default defineConfig({
  build: { cssMinify: 'esbuild' },
})
