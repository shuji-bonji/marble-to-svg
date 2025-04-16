import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // 相対パスでアセットを参照（GitHub Pagesなどにデプロイする場合に便利）
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    // ライブラリモードでビルド（他のプロジェクトで使用できるように）
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'MarbleTools',
      fileName: (format) => `marble-tools.${format}.js`,
      formats: ['es', 'umd']
    },
    
    // CSSを抽出
    cssCodeSplit: false,
    
    // ソースマップを生成
    sourcemap: true,
    
    // 分割チャンクを最小化
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true
  },
  
  // TypeScript設定
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2020',
        moduleResolution: 'node'
      }
    }
  }
});