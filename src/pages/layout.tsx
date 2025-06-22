import { A, useLocation } from '@solidjs/router';
import type { RouteSectionProps } from '@solidjs/router';
import type { Component } from 'solid-js';
import { createSignal, For, Show, createEffect } from 'solid-js';
import { gadgetList } from './(index)/gadgets';
import { PwaUpdatePrompt } from './layout/_components/pwa-update-prompt';

const Layout: Component<RouteSectionProps> = (props) => {
  const location = useLocation();
  // Check if mobile on initial load
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [sidebarOpen, setSidebarOpen] = createSignal(!isMobile);
  const [isClosing, setIsClosing] = createSignal(false);
  const [isDesktop, setIsDesktop] = createSignal(!isMobile);
  
  // Update desktop state on resize
  createEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
  
  let touchStartX = 0;
  let touchEndX = 0;
  
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].screenX;
  };
  
  const handleTouchEnd = (e: TouchEvent) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  };
  
  const handleSwipe = () => {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold && sidebarOpen()) {
      // Swipe left - close drawer
      setIsClosing(true);
      setTimeout(() => {
        setSidebarOpen(false);
        setIsClosing(false);
      }, 200);
    } else if (touchEndX > touchStartX + swipeThreshold && !sidebarOpen() && touchStartX < 20) {
      // Swipe right from edge - open drawer
      setSidebarOpen(true);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      class="h-screen flex flex-col md:flex-row bg-[#1e1e1e] text-[#cccccc] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Header / Desktop Activity Bar */}
      <div class="w-full md:w-12 h-12 md:h-full bg-[#333333] flex md:flex-col items-center md:py-2 px-2 md:px-0 gap-2 select-none">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen())}
          class="w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded md:hidden"
          title="Toggle Sidebar"
        >
          <i class="i-tabler-menu-2 text-xl" />
        </button>
        <A
          href="/"
          class={`w-10 h-10 flex items-center justify-center hover:bg-[#2a2d2e] rounded relative ${
            isActive('/') ? 'bg-[#2a2d2e]' : ''
          }`}
          title="Home"
          onClick={() => {
            if (window.innerWidth < 768) {
              // Close drawer on mobile after navigation
              setTimeout(() => {
                setIsClosing(true);
                setTimeout(() => {
                  setSidebarOpen(false);
                  setIsClosing(false);
                }, 200);
              }, 100);
            }
          }}
        >
          <i class="i-tabler-home text-xl" />
          <Show when={isActive('/')}>
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-[#007acc] md:hidden" />
            <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007acc] hidden md:block" />
          </Show>
        </A>
        <div class="flex-1 md:hidden" />
        <div class="md:hidden text-sm font-semibold select-none">Web Gadgets</div>
      </div>

      {/* Sidebar - Always visible on desktop */}
      <Show when={sidebarOpen() || isDesktop()}>
        <div 
          class={`fixed md:relative inset-y-0 left-0 md:inset-auto w-80 max-w-[85vw] md:w-64 bg-[#252526] md:border-r border-[#3e3e42] flex flex-col z-50 md:z-auto shadow-2xl md:shadow-none ${
            isClosing() && !isDesktop() ? 'drawer-exit' : !isDesktop() ? 'drawer-enter' : ''
          }`}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div class="flex items-center justify-between px-4 py-3 select-none">
            <span class="text-xs uppercase text-[#cccccc]/60 font-semibold">Explorer</span>
            <button
              onClick={() => {
                setIsClosing(true);
                setTimeout(() => {
                  setSidebarOpen(false);
                  setIsClosing(false);
                }, 200);
              }}
              class="md:hidden w-8 h-8 flex items-center justify-center hover:bg-[#2a2d2e] rounded"
            >
              <i class="i-tabler-x text-lg" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div class="px-2">
              <div class="text-xs uppercase text-[#cccccc]/60 font-semibold px-2 py-1 mt-2 select-none">
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
                    onClick={(e) => {
                      if (!gadget.available) {
                        e.preventDefault();
                      } else if (window.innerWidth < 768) {
                        // Close drawer on mobile after navigation
                        setTimeout(() => {
                          setIsClosing(true);
                          setTimeout(() => {
                            setSidebarOpen(false);
                            setIsClosing(false);
                          }, 200);
                        }, 100);
                      }
                    }}
                  >
                    <div class="flex items-center gap-2 select-none">
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

      {/* Overlay for mobile */}
      <Show when={sidebarOpen() && !isDesktop()}>
        <div
          class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => {
            setIsClosing(true);
            setTimeout(() => {
              setSidebarOpen(false);
              setIsClosing(false);
            }, 200);
          }}
        />
      </Show>
      
      {/* Edge swipe indicator */}
      <Show when={!sidebarOpen() && !isDesktop()}>
        <div class="fixed left-0 top-1/2 -translate-y-1/2 w-1 h-20 bg-[#007acc]/20 z-30 md:hidden select-none" />
      </Show>

      {/* Main Content */}
      <div class="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <div class="hidden md:flex h-9 bg-[#2d2d30] border-b border-[#3e3e42] items-center px-2 select-none">
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
        <div class="flex h-6 bg-[#007acc] text-white text-xs items-center px-2 select-none">
          <span>Web Gadgets</span>
          <span class="px-2 text-white/60">v{__APP_VERSION__}</span>
          <div class="flex-1" />
          <span class="px-2 hidden sm:inline">UTF-8</span>
          <span class="px-2 hidden sm:inline">TypeScript</span>
          <span class="px-2">Solid.js</span>
        </div>
      </div>

      {/* PWA Update Prompt */}
      <PwaUpdatePrompt />
    </div>
  );
};

export default Layout;
