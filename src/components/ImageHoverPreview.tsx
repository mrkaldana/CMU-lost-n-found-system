import { useEffect, useState, type MouseEvent, type WheelEvent } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ImageHoverPreviewProps {
  src: string;
  alt: string;
  triggerClassName?: string;
  previewAlt?: string;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.15;

export function ImageHoverPreview({ src, alt, triggerClassName, previewAlt }: ImageHoverPreviewProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setIsDragging(false);
    }
  };

  const handleWheel = (event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const direction = event.deltaY < 0 ? 1 : -1;
    setZoom((prev) => {
      const next = prev + direction * ZOOM_STEP;
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(next.toFixed(2))));
      if (clamped === MIN_ZOOM) {
        setOffset({ x: 0, y: 0 });
      }
      return clamped;
    });
  };

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (zoom <= MIN_ZOOM) return;
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - offset.x,
      y: event.clientY - offset.y,
    });
  };

  useEffect(() => {
    const handleWindowMouseMove = (event: globalThis.MouseEvent) => {
      if (!isDragging || zoom <= MIN_ZOOM) return;
      setOffset({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y,
      });
    };

    const handleWindowMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseup", handleWindowMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [dragStart.x, dragStart.y, isDragging, zoom]);

  return (
    <HoverCard open={open} onOpenChange={handleOpenChange} openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <img src={src} alt={alt} className={triggerClassName} />
      </HoverCardTrigger>
      <HoverCardContent
        sideOffset={8}
        collisionPadding={12}
        className="flex h-[min(420px,calc(100vh-40px))] w-[min(560px,calc(100vw-40px))] items-center justify-center overflow-hidden overscroll-contain p-2"
        onWheelCapture={handleWheel}
      >
        <div
          className={`flex h-full w-full items-center justify-center overflow-hidden rounded-md overscroll-contain ${
            zoom > MIN_ZOOM ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
          }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <img
            src={src}
            alt={previewAlt ?? `${alt} full preview`}
            className="h-full w-full select-none object-contain transition-transform duration-75 ease-out"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "center center" }}
            draggable={false}
          />
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
