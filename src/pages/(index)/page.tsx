import type { Component } from 'solid-js'

const IndexPage: Component = () => {
  return (
    <div class="h-full flex items-center justify-center p-8">
      <div class="max-w-2xl text-center">
        <h1 class="text-5xl font-light mb-4 text-[#cccccc]">Web Gadgets</h1>
        <p class="text-xl text-[#cccccc]/80 mb-8">
          Productivity tools that work offline and save data locally
        </p>
        
        <div class="space-y-4 text-left max-w-md mx-auto">
          <h3 class="text-lg font-semibold text-[#cccccc] mb-2">Available Tools</h3>
          <div class="space-y-3">
            <div class="flex items-start gap-3">
              <i class="i-tabler-qrcode text-[#007acc] mt-0.5" />
              <div>
                <p class="font-medium">QR Code Scanner</p>
                <p class="text-sm text-[#cccccc]/60">Extract text from QR codes with image cropping support</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-12 text-xs text-[#cccccc]/40">
          <p>All data is stored locally in your browser • No server uploads</p>
        </div>
      </div>
    </div>
  )
}

export default IndexPage