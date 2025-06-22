import { Component, createSignal, Show } from 'solid-js';
import Cropper from 'cropperjs';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (dataUrl: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ImageCropper: Component<ImageCropperProps> = (props) => {
  let imageRef: HTMLImageElement | undefined;
  let cropper: Cropper | undefined;

  const [error, setError] = createSignal<string>('');

  const initCropper = () => {
    if (!imageRef) return;

    // Cropper v2 uses a completely different API
    cropper = new Cropper(imageRef);

    // Get the cropper selection and set boundary limits
    const selection = cropper.getCropperSelection();
    if (selection) {
      // Set initial coverage
      selection.$center();
      selection.$zoom(0.8);

      // Set aspect ratio for QR codes
      selection.aspectRatio = 1;

      // Listen to change events to enforce boundaries
      selection.addEventListener('change', (event: any) => {
        const canvas = cropper?.getCropperCanvas();
        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const selectionRect = event.detail;

        // Check if selection is within canvas bounds
        if (
          selectionRect.x < 0 ||
          selectionRect.y < 0 ||
          selectionRect.x + selectionRect.width > canvasRect.width ||
          selectionRect.y + selectionRect.height > canvasRect.height
        ) {
          event.preventDefault();
        }
      });
    }
  };

  const handleCrop = async () => {
    if (!cropper) {
      setError('Cropper not initialized');
      return;
    }

    try {
      setError('');

      // Get the cropper selection first
      const selection = cropper.getCropperSelection();
      if (!selection) {
        throw new Error('No selection available');
      }

      // Export the selected area to canvas
      const canvas = await selection.$toCanvas();
      if (!canvas) {
        throw new Error('Failed to get cropped canvas');
      }

      const dataUrl = canvas.toDataURL();
      props.onCrop(dataUrl);
      // Clear any local errors on successful crop
      setError('');
    } catch (err: unknown) {
      console.error('Cropper error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to crop image');
      } else {
        setError('Failed to crop image');
      }
    }
  };

  return (
    <div class="space-y-4">
      <p class="text-sm text-[#cccccc]/60 select-none">
        No QR code found. Try cropping the image to isolate the QR code:
      </p>

      <Show when={error()}>
        <div class="p-3 bg-[#5a1d1d] text-[#f48771] rounded border border-[#f48771]/20 text-sm">
          {error()}
        </div>
      </Show>

      <div class="relative w-full max-w-lg mx-auto aspect-square bg-[#252526] rounded overflow-hidden">
        <img
          ref={imageRef}
          src={props.imageUrl}
          onLoad={initCropper}
          alt="Image to scan"
          class="w-full h-full object-contain"
        />
      </div>

      <div class="flex gap-4">
        <button
          onClick={handleCrop}
          class="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors flex items-center gap-2 select-none"
          disabled={props.isLoading}
        >
          <i class="i-tabler-scan" />
          Scan Cropped Area
        </button>
        <button
          onClick={props.onCancel}
          class="px-4 py-2 bg-[#3e3e42] text-[#cccccc] rounded hover:bg-[#505050] transition-colors flex items-center gap-2 select-none"
        >
          <i class="i-tabler-x" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ImageCropper;
