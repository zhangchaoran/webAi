// src/vite-env.d.ts 添加类型声明
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AI_API_KEY: string
    // 添加其他环境变量...
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }