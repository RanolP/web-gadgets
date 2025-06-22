/// <reference types="vite-plugin-pwa/client" />

declare module 'virtual:pwa-register/solid' {
  import type { Accessor, Setter } from 'solid-js'
  import type { RegisterSWOptions } from 'vite-plugin-pwa/types'

  export type UseRegisterSWReturn = {
    needRefresh: [Accessor<boolean>, Setter<boolean>]
    offlineReady: [Accessor<boolean>, Setter<boolean>]
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }

  export function useRegisterSW(options?: RegisterSWOptions): UseRegisterSWReturn
}