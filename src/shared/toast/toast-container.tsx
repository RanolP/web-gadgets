import { Component, For } from 'solid-js';
import { toasts } from './store';
import ToastItem from './toast-item';

const ToastContainer: Component = () => {
  return (
    <div class="fixed bottom-4 right-4 left-4 md:left-auto z-50 pointer-events-none">
      <div class="pointer-events-auto flex flex-col items-center md:items-end">
        <For each={toasts()}>
          {(toast) => <ToastItem toast={toast} />}
        </For>
      </div>
    </div>
  );
};

export default ToastContainer;