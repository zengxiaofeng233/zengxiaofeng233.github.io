/// <reference types="vite/client" />

declare module '*.css'

declare global {
  interface Window {
    BMapGL: any
    [key: string]: any
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

export {}
