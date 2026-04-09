import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface CoordinateMapHoverProps {
  lat: number;
  lng: number;
  triggerText?: string;
  className?: string;
}

function buildEmbedUrl(lat: number, lng: number) {
  const delta = 0.0012;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function CoordinateMapHover({ lat, lng, triggerText, className }: CoordinateMapHoverProps) {
  return (
    <HoverCard openDelay={100}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          className={className ?? "font-mono underline underline-offset-2 decoration-dotted"}
          aria-label={`View map for coordinates ${lat}, ${lng}`}
        >
          {triggerText ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
        </button>
      </HoverCardTrigger>
      <HoverCardContent sideOffset={8} className="w-[300px] p-2">
        <iframe
          title="Location map preview"
          src={buildEmbedUrl(lat, lng)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[200px] w-full rounded-md border"
        />
        <p className="mt-2 text-[11px] text-muted-foreground font-mono">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      </HoverCardContent>
    </HoverCard>
  );
}
