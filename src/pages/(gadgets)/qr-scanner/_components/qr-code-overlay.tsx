import { Component, createSignal, onMount, Show } from 'solid-js';

interface Point {
  x: number;
  y: number;
}

interface QrCodeOverlayProps {
  imageUrl: string;
  resultPoints?: Point[];
}

const QrCodeOverlay: Component<QrCodeOverlayProps> = (props) => {
  const [imageDimensions, setImageDimensions] = createSignal<{
    width: number;
    height: number;
    naturalWidth: number;
    naturalHeight: number;
  } | null>(null);

  let imageRef: HTMLImageElement | undefined;

  const handleImageLoad = () => {
    if (!imageRef) return;
    
    const rect = imageRef.getBoundingClientRect();
    setImageDimensions({
      width: rect.width,
      height: rect.height,
      naturalWidth: imageRef.naturalWidth,
      naturalHeight: imageRef.naturalHeight,
    });
  };

  const getScaledPoint = (point: Point) => {
    const dims = imageDimensions();
    if (!dims) return { x: 0, y: 0 };

    const scaleX = dims.width / dims.naturalWidth;
    const scaleY = dims.height / dims.naturalHeight;

    return {
      x: point.x * scaleX,
      y: point.y * scaleY,
    };
  };

  const getPolygonPoints = () => {
    if (!props.resultPoints || props.resultPoints.length < 3) return '';
    
    return props.resultPoints
      .map((point) => {
        const scaled = getScaledPoint(point);
        return `${scaled.x},${scaled.y}`;
      })
      .join(' ');
  };

  return (
    <div class="relative inline-block">
      <img
        ref={imageRef}
        src={props.imageUrl}
        alt="Full size image"
        class="max-w-full max-h-[90vh] object-contain"
        onLoad={handleImageLoad}
      />
      
      <Show when={imageDimensions() && props.resultPoints && props.resultPoints.length >= 3}>
        <svg
          class="absolute top-0 left-0 pointer-events-none"
          style={{
            width: `${imageDimensions()!.width}px`,
            height: `${imageDimensions()!.height}px`,
          }}
        >
          {/* QR Code boundary polygon */}
          <polygon
            points={getPolygonPoints()}
            fill="none"
            stroke="#007acc"
            stroke-width="3"
            stroke-dasharray="5,5"
          />
          
          {/* Corner dots */}
          {props.resultPoints!.map((point) => {
            const scaled = getScaledPoint(point);
            return (
              <circle
                cx={scaled.x}
                cy={scaled.y}
                r="6"
                fill="#007acc"
              />
            );
          })}
        </svg>
      </Show>
    </div>
  );
};

export default QrCodeOverlay;