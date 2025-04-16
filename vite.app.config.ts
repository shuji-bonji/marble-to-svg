import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // GitHub Pagesのベースパス
  base: '/marble-to-svg/',
  
  // ビルド設定
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    
    // アプリケーションモードでビルド
    // ここにはlib設定はありません
    
    // CSSを抽出
    cssCodeSplit: false,
    
    // ソースマップを生成
    sourcemap: true,
    
    // アセットのインライン化サイズ制限
    assetsInlineLimit: 4096,
    
    // サイズ警告の閾値（キロバイト単位）
    chunkSizeWarningLimit: 500,
    
    // HTMLの圧縮設定
    minify: true,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    }
  },
  
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  // プラグイン（必要に応じて追加）
  plugins: [],
  
  // 解決設定
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        target: 'ES2020',
      }
    }
  }
});