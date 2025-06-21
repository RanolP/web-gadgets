import { A, useLocation } from '@solidjs/router';
import type { RouteSectionProps } from '@solidjs/router';
import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { gadgetList } from './(index)/gadgets';

const Layout: Component<RouteSectionProps> = (props) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = createSignal(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div class="h-screen flex bg-[#1e1e1e] text-[#cccccc] overflow-hidden">
      {/* Activity Bar */}
      <div class="w-12 bg-[#333333] flex flex-col items-center py-2 gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen())}
          class="w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded"
          title="Toggle Sidebar"
        >
          <i class="i-tabler-menu-2 text-xl" />
        </button>
        <A
          href="/"
          class={`w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded ${
            isActive('/') ? 'bg-[#2a2d2e] border-l-2 border-[#007acc]' : ''
          }`}
          title="Home"
        >
          <i class="i-tabler-home text-xl" />
        </A>
      </div>

      {/* Sidebar */}
      <Show when={sidebarOpen()}>
        <div class="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          <div class="px-4 py-3 text-xs uppercase text-[#cccccc]/60 font-semibold">
            Explorer
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="px-2">
              <div class="text-xs uppercase text-[#cccccc]/60 font-semibold px-2 py-1 mt-2">
                Gadgets
              </div>
              <For each={gadgetList}>
                {(gadget) => (
                  <A
                    href={gadget.route}
                    class={`block px-2 py-1 hover:bg-[#2a2d2e] rounded text-sm ${
                      isActive(gadget.route) ? 'bg-[#37373d]' : ''
                    } ${
                      !gadget.available ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={(e) => !gadget.available && e.preventDefault()}
                  >
                    <div class="flex items-center gap-2">
                      <i class={`${gadget.icon} text-base text-[#007acc]`} />
                      <span class={gadget.available ? '' : 'line-through'}>
                        {gadget.name}
                      </span>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>

      {/* Main Content */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <div class="h-9 bg-[#2d2d30] border-b border-[#3e3e42] flex items-center px-2">
          <div class="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] rounded text-sm">
            <i
              class={`${
                location.pathname === '/'
                  ? 'i-tabler-home'
                  : gadgetList.find((g) => g.route === location.pathname)
                      ?.icon || 'i-tabler-file'
              } text-base text-[#007acc]`}
            />
            <span>
              {location.pathname === '/'
                ? 'Welcome'
                : gadgetList.find((g) => g.route === location.pathname)?.name ||
                  'Unknown'}
            </span>
          </div>
        </div>

        {/* Editor Area */}
        <div class="flex-1 overflow-auto bg-[#1e1e1e]">
          <div class="h-full">{props.children}</div>
        </div>

        {/* Status Bar */}
        <div class="h-6 bg-[#007acc] text-white text-xs flex items-center px-2">
          <span>Web Gadgets</span>
          <div class="flex-1" />
          <span class="px-2">UTF-8</span>
          <span class="px-2">TypeScript</span>
          <span class="px-2">Solid.js</span>
        </div>
      </div>
    </div>
  );
};

export default Layout;
