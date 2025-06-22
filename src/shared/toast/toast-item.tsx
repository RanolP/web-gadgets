import { Component, createSignal, onMount } from 'solid-js';
import type { Toast } from './types';
import { removeToast } from './store';

interface ToastItemProps {
  toast: Toast;
}

const ToastItem: Component<ToastItemProps> = (props) => {
  const [isExiting, setIsExiting] = createSignal(false);

  const getIcon = () => {
    switch (props.toast.type) {
      case 'success':
        return 'i-tabler-circle-check';
      case 'error':
        return 'i-tabler-circle-x';
      case 'warning':
        return 'i-tabler-alert-triangle';
      case 'info':
      default:
        return 'i-tabler-info-circle';
    }
  };

  const getColorClasses = () => {
    switch (props.toast.type) {
      case 'success':
        return 'border-[#4ec9b0] text-[#4ec9b0]';
      case 'error':
        return 'border-[#f48771] text-[#f48771]';
      case 'warning':
        return 'border-[#dcdcaa] text-[#dcdcaa]';
      case 'info':
      default:
        return 'border-[#007acc] text-[#007acc]';
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(props.toast.id);
    }, 200); // Match animation duration
  };

  onMount(() => {
    // Start exit animation slightly before removal
    if (props.toast.duration && props.toast.duration > 0) {
      setTimeout(() => {
        setIsExiting(true);
      }, props.toast.duration - 200);
    }
  });

  return (
    <div
      class={`
        relative flex items-center gap-3 px-4 py-3 mb-3
        bg-[#252526] rounded-lg border ${getColorClasses()}
        shadow-lg transition-all duration-200 select-none
        w-full max-w-sm md:w-auto md:min-w-80 md:max-w-md
        ${isExiting() ? 'animate-toast-slide-out opacity-0' : 'animate-toast-slide-up'}
      `}
    >
      <i class={`${getIcon()} text-xl flex-shrink-0`} />
      <p class="flex-1 text-sm text-[#cccccc]">{props.toast.message}</p>
      <button
        onClick={handleClose}
        class="flex-shrink-0 text-[#cccccc]/60 hover:text-[#cccccc] transition-colors"
        aria-label="Dismiss"
      >
        <i class="i-tabler-x text-lg" />
      </button>
    </div>
  );
};

export default ToastItem;