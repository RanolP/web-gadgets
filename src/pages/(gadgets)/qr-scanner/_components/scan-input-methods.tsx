import { Component, Show } from 'solid-js';

interface ScanInputMethodsProps {
  isScanning: boolean;
  onFileSelect: (file: File) => void;
  onPasteClick: () => void;
}

const ScanInputMethods: Component<ScanInputMethodsProps> = (props) => {
  let fileInputRef: HTMLInputElement | undefined;

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      props.onFileSelect(file);
    }
  };

  return (
    <div class="flex flex-col sm:flex-row gap-4">
      <button
        onClick={() => fileInputRef?.click()}
        class="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial select-none"
        disabled={props.isScanning}
      >
        <i class="i-tabler-upload" />
        Select File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        class="hidden"
      />

      {/* Show instruction on non-touch devices */}
      <div class="px-4 py-2 border-2 border-dashed border-[#3e3e42] rounded text-[#cccccc]/60 flex items-center justify-center gap-2 flex-1 sm:flex-initial select-none flex touch:hidden">
        <i class="i-tabler-clipboard" />
        <span class="hidden sm:inline">Paste image (Ctrl+V)</span>
        <span class="sm:hidden">Paste (Ctrl+V)</span>
      </div>

      {/* Show button on touch devices */}
      <button
        onClick={props.onPasteClick}
        class="px-4 py-2 bg-[#3e3e42] text-[#cccccc] rounded hover:bg-[#505050] transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial select-none hidden touch:flex"
        disabled={props.isScanning}
      >
        <i class="i-tabler-clipboard" />
        Paste Image
      </button>
    </div>
  );
};

export default ScanInputMethods;