import type { Component } from 'solid-js';
import { A } from '@solidjs/router';

const IndexPage: Component = () => {
  return (
    <div class="h-full flex items-center justify-center p-4 sm:p-8">
      <div class="max-w-2xl w-fit">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-light mb-4 text-[#cccccc]">
          Web Gadgets
        </h1>
        <p class="text-lg sm:text-xl text-[#cccccc]/80 mb-8">
          Productivity tools that work offline and save data locally
        </p>

        <div class="space-y-4">
          <h3 class="text-sm uppercase text-[#cccccc]/60 font-semibold tracking-wider select-none">
            Start
          </h3>
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-sm">
              <i class="i-tabler-qrcode text-[#007acc]" />
              <A
                href="/qr-scanner"
                class="text-[#007acc] hover:underline"
              >
                ./qr-scanner
              </A>
              <span class="text-[#cccccc]/60">: Extract text from QR codes with image cropping support</span>
            </div>
          </div>
        </div>

        <div class="mt-8 sm:mt-12 text-xs text-[#cccccc]/40">
          <p>All data is stored locally in your browser. no server uploads</p>
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
