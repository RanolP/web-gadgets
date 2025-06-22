import {
  createSignal,
  onCleanup,
  Component,
  Show,
  For,
  lazy,
  Suspense,
  onMount,
  createEffect,
} from 'solid-js';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { Result } from '@zxing/library';

const ImageCropper = lazy(() => import('./_components/image-cropper'));
const ScanResultItem = lazy(() => import('./_components/scan-result-item'));

interface ScanResult {
  id: string;
  text: string;
  format: string;
  timestamp: Date;
  imageUrl: string;
  resultPoints?: Array<{ x: number; y: number }>;
}

const STORAGE_KEY = 'qr-scanner-results';
const DB_NAME = 'qr-scanner-db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

// Save blob to IndexedDB
const saveBlob = async (id: string, blob: Blob): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  store.put(blob, id);
  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
};

// Load blob from IndexedDB
const loadBlob = async (id: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to load blob:', err);
    return null;
  }
};

// Delete blob from IndexedDB
const deleteBlob = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.error('Failed to delete blob:', err);
  }
};

const QrScanner: Component = () => {
  const [scanResults, setScanResults] = createSignal<ScanResult[]>([]);
  const [isScanning, setIsScanning] = createSignal(false);
  const [error, setError] = createSignal<string>('');
  const [imageUrl, setImageUrl] = createSignal<string>('');
  const [showCropper, setShowCropper] = createSignal(false);
  const [selectedResult, setSelectedResult] = createSignal<ScanResult | null>(
    null,
  );

  let fileInputRef: HTMLInputElement | undefined;

  const codeReader = new BrowserMultiFormatReader();

  // Load saved results from localStorage on mount
  onMount(async () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects and load blobs
        const results = await Promise.all(
          parsed.map(async (r: any) => {
            const result = {
              ...r,
              timestamp: new Date(r.timestamp),
              imageUrl: '', // Will be replaced with blob URL
            };

            // Try to load blob from IndexedDB
            const blob = await loadBlob(r.id);
            if (blob) {
              result.imageUrl = URL.createObjectURL(blob);
            }

            return result;
          }),
        );
        setScanResults(results.filter((r) => r.imageUrl)); // Only keep results with valid images
      }
    } catch (err) {
      console.error('Failed to load saved results:', err);
    }
  });

  // Save results to localStorage whenever they change
  createEffect(() => {
    const results = scanResults();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (err) {
      console.error('Failed to save results:', err);
    }
  });

  onCleanup(() => {
    // BrowserMultiFormatReader doesn't have a reset method in newer versions
    // Only clean up blob URLs, but keep IndexedDB data for persistence
    scanResults().forEach((result) => {
      if (result.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(result.imageUrl);
      }
    });
    if (imageUrl() && imageUrl().startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl());
    }
  });

  const handleScanResult = async (result: Result, imgUrl: string) => {
    // Extract result points (corners of QR code)
    const points = result.getResultPoints();
    const resultPoints = points
      ? points.map((point) => ({
          x: point.getX(),
          y: point.getY(),
        }))
      : undefined;

    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Convert blob URL to blob and save it
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      await saveBlob(id, blob);
    } catch (err) {
      console.error('Failed to save image blob:', err);
    }

    const newResult: ScanResult = {
      id,
      text: result.getText(),
      format: result.getBarcodeFormat().toString(),
      timestamp: new Date(),
      imageUrl: imgUrl,
      resultPoints,
    };
    setScanResults([newResult, ...scanResults()]);
    setError('');
  };

  const handleError = (err: unknown) => {
    console.error('Scan error:', err);
    // Handle common scanning errors with user-friendly messages
    if (err instanceof Error) {
      if (
        err.name === 'NotFoundException' ||
        err.message?.includes('No MultiFormat Readers')
      ) {
        setError(
          'No QR code found in the selected area. Please try cropping closer to the QR code.',
        );
      } else {
        setError(err.message || 'Failed to scan QR code');
      }
    } else {
      setError('Failed to scan QR code');
    }
  };

  // Scan from clipboard (paste)
  const handlePaste = async (e: ClipboardEvent) => {
    e.preventDefault();
    const items = e.clipboardData?.items;

    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          await scanFile(file);
        }
      }
    }
  };

  // Handle paste button click
  const handlePasteClick = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageTypes = item.types.filter((type) =>
          type.startsWith('image/'),
        );
        if (imageTypes.length > 0) {
          const blob = await item.getType(imageTypes[0]);
          const file = new File([blob], 'pasted-image.png', {
            type: blob.type,
          });
          await scanFile(file);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError(
        'Failed to paste from clipboard. Make sure you have an image copied.',
      );
    }
  };

  // Scan from file
  const handleFileSelect = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      await scanFile(file);
    }
  };

  const scanFile = async (file: File) => {
    try {
      setIsScanning(true);
      setError('');

      const url = URL.createObjectURL(file);
      setImageUrl(url);

      // Try to scan directly first
      const result = await codeReader.decodeFromImageUrl(url);
      handleScanResult(result, url);
    } catch (err) {
      // If direct scan fails, show cropper
      setShowCropper(true);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle cropped image
  const handleCroppedImage = async (dataUrl: string) => {
    try {
      setIsScanning(true);
      setError('');

      const result = await codeReader.decodeFromImageUrl(dataUrl);

      // Convert data URL to blob URL for consistency
      const blob = await (await fetch(dataUrl)).blob();
      const blobUrl = URL.createObjectURL(blob);

      handleScanResult(result, blobUrl);

      setShowCropper(false);
      // Don't revoke the original URL as we're using it in results
      setImageUrl('');
    } catch (err) {
      handleError(err);
    } finally {
      setIsScanning(false);
    }
  };

  const cancelCrop = () => {
    setShowCropper(false);
    if (imageUrl() && imageUrl().startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl());
    }
    setImageUrl('');
  };

  const [deleteConfirm, setDeleteConfirm] = createSignal<'all' | 'old' | null>(
    null,
  );
  
  let deleteDialogRef: HTMLDialogElement | undefined;

  const deleteResult = async (id: string) => {
    const result = scanResults().find((r) => r.id === id);
    if (result) {
      // Delete from IndexedDB
      await deleteBlob(id);
      // Revoke blob URL
      if (result.imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(result.imageUrl);
      }
    }

    setScanResults(scanResults().filter((r) => r.id !== id));
    // If the deleted result was selected, close the dialog
    if (selectedResult()?.id === id) {
      setSelectedResult(null);
    }
  };

  const deleteAllResults = async () => {
    // Clean up blob URLs and IndexedDB
    await Promise.all(
      scanResults().map(async (result) => {
        await deleteBlob(result.id);
        if (result.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(result.imageUrl);
        }
      }),
    );
    setScanResults([]);
    setSelectedResult(null);
  };

  const deleteOldResults = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const oldResults = scanResults().filter((r) => r.timestamp < sevenDaysAgo);
    const recentResults = scanResults().filter(
      (r) => r.timestamp >= sevenDaysAgo,
    );

    if (oldResults.length === 0) {
      // No old results, do nothing silently
      return;
    }

    // Clean up blob URLs and IndexedDB from old results
    await Promise.all(
      oldResults.map(async (result) => {
        await deleteBlob(result.id);
        if (result.imageUrl.startsWith('blob:')) {
          URL.revokeObjectURL(result.imageUrl);
        }
      }),
    );

    setScanResults(recentResults);

    // If selected result was deleted, close dialog
    if (
      selectedResult() &&
      oldResults.some((r) => r.id === selectedResult()!.id)
    ) {
      setSelectedResult(null);
    }
  };

  const getOldResultsCount = () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return scanResults().filter((r) => r.timestamp < sevenDaysAgo).length;
  };

  const showDeleteDialog = (type: 'all' | 'old') => {
    setDeleteConfirm(type);
    deleteDialogRef?.showModal();
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm() === 'all') {
      await deleteAllResults();
    } else if (deleteConfirm() === 'old') {
      await deleteOldResults();
    }
    deleteDialogRef?.close();
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    deleteDialogRef?.close();
    setDeleteConfirm(null);
  };

  return (
    <div class="h-full p-4 md:p-8 overflow-auto" onPaste={handlePaste}>
      <div class="max-w-4xl">
        <h1 class="text-2xl md:text-3xl font-light mb-4 text-[#cccccc]">
          QR Code Scanner
        </h1>
        <p class="text-sm text-[#cccccc]/70 mb-8">
          Scan QR codes from images via file upload, clipboard paste, or drag &
          drop. Results are saved locally with image previews.
        </p>

        <div class="space-y-6">
          {/* Input Methods */}
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => fileInputRef?.click()}
              class="px-4 py-2 bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial select-none"
              disabled={isScanning()}
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
              onClick={handlePasteClick}
              class="px-4 py-2 bg-[#3e3e42] text-[#cccccc] rounded hover:bg-[#505050] transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-initial select-none hidden touch:flex"
              disabled={isScanning()}
            >
              <i class="i-tabler-clipboard" />
              Paste Image
            </button>
          </div>

          {/* Error Display */}
          <Show when={error()}>
            <div class="p-4 bg-[#5a1d1d] text-[#f48771] rounded border border-[#f48771]/20">
              {error()}
            </div>
          </Show>

          {/* Loading State */}
          <Show when={isScanning()}>
            <div class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007acc]"></div>
              <p class="mt-2">Scanning...</p>
            </div>
          </Show>

          {/* Cropper */}
          <Show when={showCropper() && imageUrl()}>
            <Suspense
              fallback={<div class="text-center py-4">Loading cropper...</div>}
            >
              <ImageCropper
                imageUrl={imageUrl()}
                onCrop={handleCroppedImage}
                onCancel={cancelCrop}
                isLoading={isScanning()}
              />
            </Suspense>
          </Show>

          {/* Results */}
          <Show when={scanResults().length > 0}>
            <div class="space-y-4">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h3 class="text-lg font-semibold select-none">
                  Scan Results ({scanResults().length})
                </h3>
                <div class="flex flex-wrap gap-2">
                  <button
                    onClick={() => showDeleteDialog('old')}
                    class="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-[#3e3e42] text-[#cccccc] rounded hover:bg-[#505050] transition-colors flex items-center gap-1 select-none"
                    disabled={getOldResultsCount() === 0}
                  >
                    <i class="i-tabler-trash text-xs" />
                    Delete Old (7+ days)
                  </button>
                  <button
                    onClick={() => showDeleteDialog('all')}
                    class="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-[#5a1d1d] text-[#f48771] rounded hover:bg-[#6a2d2d] transition-colors flex items-center gap-1 select-none"
                  >
                    <i class="i-tabler-trash text-xs" />
                    Delete All
                  </button>
                </div>
              </div>
              <For each={scanResults()}>
                {(result) => (
                  <Suspense
                    fallback={
                      <div class="p-4 bg-[#252526] border border-[#3e3e42] rounded animate-pulse h-28" />
                    }
                  >
                    <ScanResultItem
                      result={result}
                      onImageClick={() => setSelectedResult(result)}
                      onDelete={deleteResult}
                    />
                  </Suspense>
                )}
              </For>
            </div>
          </Show>
        </div>
      </div>

      {/* Image Dialog */}
      <Show when={selectedResult()}>
        <div
          class="fixed inset-0 bg-black/80 flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={() => setSelectedResult(null)}
        >
          <div
            class="relative max-w-4xl max-h-[90vh] bg-[#1e1e1e] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="absolute top-2 right-2 z-10">
              <button
                onClick={() => setSelectedResult(null)}
                class="w-8 h-8 flex items-center justify-center bg-[#252526] rounded hover:bg-[#3e3e42] transition-colors"
              >
                <i class="i-tabler-x" />
              </button>
            </div>
            <div class="relative">
              <img
                src={selectedResult()!.imageUrl}
                alt="Full size image"
                class="max-w-full max-h-[90vh] object-contain"
                onLoad={(e) => {
                  const img = e.currentTarget;
                  const result = selectedResult();
                  if (result?.resultPoints && result.resultPoints.length >= 3) {
                    // Create SVG overlay
                    const rect = img.getBoundingClientRect();
                    const scaleX = rect.width / img.naturalWidth;
                    const scaleY = rect.height / img.naturalHeight;

                    const svg = document.createElementNS(
                      'http://www.w3.org/2000/svg',
                      'svg',
                    );
                    svg.style.position = 'absolute';
                    svg.style.top = '0';
                    svg.style.left = '0';
                    svg.style.width = rect.width + 'px';
                    svg.style.height = rect.height + 'px';
                    svg.style.pointerEvents = 'none';

                    // Create polygon for QR code area
                    const polygon = document.createElementNS(
                      'http://www.w3.org/2000/svg',
                      'polygon',
                    );
                    const points = result.resultPoints
                      .map((p) => `${p.x * scaleX},${p.y * scaleY}`)
                      .join(' ');
                    polygon.setAttribute('points', points);
                    polygon.setAttribute('fill', 'none');
                    polygon.setAttribute('stroke', '#007acc');
                    polygon.setAttribute('stroke-width', '3');
                    polygon.setAttribute('stroke-dasharray', '5,5');

                    // Add corner dots
                    result.resultPoints.forEach((point) => {
                      const circle = document.createElementNS(
                        'http://www.w3.org/2000/svg',
                        'circle',
                      );
                      circle.setAttribute('cx', String(point.x * scaleX));
                      circle.setAttribute('cy', String(point.y * scaleY));
                      circle.setAttribute('r', '6');
                      circle.setAttribute('fill', '#007acc');
                      svg.appendChild(circle);
                    });

                    svg.appendChild(polygon);

                    // Remove any existing overlay
                    const existingSvg = img.parentElement?.querySelector('svg');
                    if (existingSvg) {
                      existingSvg.remove();
                    }

                    img.parentElement?.appendChild(svg);
                  }
                }}
              />
            </div>
          </div>
        </div>
      </Show>
      
      {/* Delete Confirmation Dialog */}
      <dialog
        ref={deleteDialogRef}
        class="p-0 rounded-lg bg-[#252526] text-[#cccccc] border border-[#3e3e42] backdrop:bg-black/50 m-auto"
        onClick={(e) => {
          if (e.target === deleteDialogRef) {
            handleCancelDelete();
          }
        }}
      >
        <div class="p-6 min-w-96">
          <h3 class="text-lg font-semibold mb-4">
            {deleteConfirm() === 'all' ? 'Delete All Results?' : 'Delete Old Results?'}
          </h3>
          <p class="text-sm mb-6 text-[#cccccc]/80">
            <Show
              when={deleteConfirm() === 'all'}
              fallback={
                <>
                  Are you sure you want to delete {getOldResultsCount()} results older than 7 days? 
                  This action cannot be undone.
                </>
              }
            >
              Are you sure you want to delete all {scanResults().length} QR code results? 
              This action cannot be undone.
            </Show>
          </p>
          <div class="flex gap-3 justify-end">
            <button
              onClick={handleCancelDelete}
              class="px-4 py-2 text-sm bg-[#3e3e42] text-[#cccccc] rounded hover:bg-[#505050] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              class="px-4 py-2 text-sm bg-[#f48771] text-white rounded hover:bg-[#e06050] transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default QrScanner;
