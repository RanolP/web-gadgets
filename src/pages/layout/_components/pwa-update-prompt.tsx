import { createSignal, onMount, Show } from 'solid-js'
import { useRegisterSW } from 'virtual:pwa-register/solid'

export function PwaUpdatePrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const [showPrompt, setShowPrompt] = createSignal(false)

  onMount(() => {
    if (needRefresh()) {
      setShowPrompt(true)
    }
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
    setShowPrompt(false)
  }

  const updateNow = () => {
    updateServiceWorker(true)
  }

  return (
    <>
      <Show when={offlineReady() && !needRefresh()}>
        <div class="fixed bottom-6 right-6 bg-[#252526] text-[#cccccc] px-4 py-3 rounded border border-[#007acc] shadow-lg flex items-center gap-3 animate-slide-up">
          <i class="i-tabler-circle-check text-xl text-[#007acc]" />
          <div>
            <p class="font-medium text-sm">App ready to work offline</p>
          </div>
          <button
            onClick={close}
            class="ml-2 text-[#cccccc]/60 hover:text-[#cccccc] transition-colors"
            aria-label="Dismiss"
          >
            <i class="i-tabler-x text-lg" />
          </button>
        </div>
      </Show>

      <Show when={showPrompt() && needRefresh()}>
        <div class="fixed bottom-6 right-6 bg-[#252526] text-[#cccccc] px-4 py-3 rounded border border-[#007acc] shadow-lg max-w-sm animate-slide-up">
          <div class="flex items-start gap-3">
            <i class="i-tabler-refresh-alert text-xl mt-0.5 text-[#007acc]" />
            <div class="flex-1">
              <p class="font-medium text-sm">New content available</p>
              <p class="text-xs mt-1 text-[#cccccc]/60">Click update to get the latest version</p>
              <div class="flex gap-2 mt-3">
                <button
                  onClick={updateNow}
                  class="bg-[#007acc] text-white px-3 py-1 rounded text-sm font-medium hover:bg-[#005a9e] transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={close}
                  class="text-[#cccccc]/60 hover:text-[#cccccc] px-3 py-1 rounded text-sm transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </>
  )
}