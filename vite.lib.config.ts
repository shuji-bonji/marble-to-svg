import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // ビルド設定
  build: {
    outDir: 'dist/lib',
    emptyOutDir: true,
    
    // ライブラリモードでビルド
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'MarbleTools',
      fileName: (format) => `marble-tools.${format}.js`,
      formats: ['es', 'umd']
    },
    
    // CSS設定
    cssCodeSplit: false,
    
    // ソースマップを生成
    sourcemap: true,
    
    // Roll-up設定
    rollupOptions: {
      // 外部依存関係を設定（必要に応じて）
      external: [],
      output: {
        // グローバル変数名の設定（UMDビルド用）
        globals: {},
        // サイズを小さくするための最適化
        manualChunks: undefined
      }
    }
  },
});