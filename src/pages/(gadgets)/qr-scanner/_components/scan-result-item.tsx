import { Component, Show, createSignal } from 'solid-js';
import { showToast } from '../../../../shared/toast';

interface ScanResultItemProps {
  result: {
    id: string;
    text: string;
    format: string;
    timestamp: Date;
    imageUrl: string;
    resultPoints?: Array<{ x: number; y: number }>;
    imageDimensions?: { width: number; height: number };
  };
  onImageClick: () => void;
  onDelete: (id: string) => void;
}

const ScanResultItem: Component<ScanResultItemProps> = (props) => {
  const [copiedId, setCopiedId] = createSignal<string | null>(null);

  const isValidUrl = (text: string): boolean => {
    try {
      const url = new URL(text);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const copyToClipboard = async (text: string, resultId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(resultId);
      showToast('Copied to clipboard!', 'success', 2000);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const formatTimestamp = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Get timezone name (IANA format)
    const timeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (${timeZoneName})`;
  };

  return (
    <div class="p-4 bg-[#252526] border border-[#3e3e42] rounded flex gap-4">
      <button
        onClick={props.onImageClick}
        class="w-20 h-20 flex-shrink-0 bg-[#1e1e1e] rounded overflow-hidden hover:ring-2 hover:ring-[#007acc] transition-all cursor-pointer relative"
      >
        <img
          src={props.result.imageUrl}
          alt="Scanned image"
          class="w-full h-full object-cover"
        />
        <Show when={props.result.resultPoints && props.result.resultPoints.length >= 3 && props.result.imageDimensions}>
          <div class="absolute inset-0 pointer-events-none">
            <svg
              class="w-full h-full"
              viewBox={`0 0 ${props.result.imageDimensions!.width} ${props.result.imageDimensions!.height}`}
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Subtle shadow for depth */}
              <polygon
                points={props.result.resultPoints
                  ?.map((p) => `${p.x},${p.y}`)
                  .join(' ')}
                fill="rgba(0, 0, 0, 0.2)"
                stroke="none"
                transform="translate(3, 3)"
              />
              {/* White brutal stroke */}
              <polygon
                points={props.result.resultPoints
                  ?.map((p) => `${p.x},${p.y}`)
                  .join(' ')}
                fill="none"
                stroke="#ffffff"
                stroke-width={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 25}
                stroke-linejoin="miter"
              />
              {/* Main colored polygon - thick and bold */}
              <polygon
                points={props.result.resultPoints
                  ?.map((p) => `${p.x},${p.y}`)
                  .join(' ')}
                fill="rgba(0, 122, 204, 0.4)"
                stroke="#007acc"
                stroke-width={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 30}
                stroke-linejoin="miter"
              />
              {/* Brutal corner markers */}
              {props.result.resultPoints?.map((point, index) => (
                <>
                  {/* Subtle shadow square */}
                  <rect
                    x={point.x - Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 30}
                    y={point.y - Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 30}
                    width={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 15}
                    height={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 15}
                    fill="rgba(0, 0, 0, 0.3)"
                    transform="translate(2, 2)"
                  />
                  {/* White background square */}
                  <rect
                    x={point.x - Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 30}
                    y={point.y - Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 30}
                    width={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 15}
                    height={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 15}
                    fill="#ffffff"
                    stroke="#000000"
                    stroke-width={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 200}
                  />
                  {/* Colored square */}
                  <rect
                    x={point.x - Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 40}
                    y={point.y - Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 40}
                    width={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 20}
                    height={Math.max(props.result.imageDimensions!.width, props.result.imageDimensions!.height) / 20}
                    fill="#007acc"
                  />
                </>
              ))}
            </svg>
          </div>
        </Show>
      </button>
      
      <div class="flex-1 space-y-2">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 break-all">
            <p class="font-mono text-sm">{props.result.text}</p>
          </div>
          <div class="flex flex-col gap-2">
            <Show when={isValidUrl(props.result.text)}>
              <a
                href={props.result.text}
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1 text-sm bg-[#007acc] text-white rounded hover:bg-[#005a9e] transition-colors flex items-center justify-center gap-1 min-w-20"
              >
                <i class="i-tabler-external-link text-xs" />
                Open
              </a>
            </Show>
            <button
              onClick={() => copyToClipboard(props.result.text, props.result.id)}
              class={`px-3 py-1 text-sm rounded transition-colors flex items-center justify-center gap-1 min-w-20 ${
                isValidUrl(props.result.text)
                  ? 'border border-[#007acc] text-[#007acc] hover:bg-[#007acc] hover:text-white'
                  : 'bg-[#007acc] text-white hover:bg-[#005a9e]'
              }`}
            >
              <i
                class={
                  copiedId() === props.result.id
                    ? 'i-tabler-check text-xs'
                    : 'i-tabler-copy text-xs'
                }
              />
              {copiedId() === props.result.id ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => props.onDelete(props.result.id)}
              class="px-3 py-1 text-sm bg-[#3e3e42] text-[#cccccc] rounded hover:bg-[#5a1d1d] hover:text-[#f48771] transition-colors flex items-center justify-center gap-1 min-w-20"
            >
              <i class="i-tabler-trash text-xs" />
              Delete
            </button>
          </div>
        </div>
        <div class="flex gap-4 text-xs text-[#cccccc]/60 select-none">
          <span>Format: {props.result.format}</span>
          <span>{formatTimestamp(props.result.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default ScanResultItem;