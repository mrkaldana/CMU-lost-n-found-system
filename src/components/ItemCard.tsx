import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ImageHoverPreview } from "@/components/ImageHoverPreview";
import { StatusBadge } from "@/components/StatusBadge";
import { CoordinateMapHover } from "@/components/CoordinateMapHover";
import { LostItem, CATEGORIES } from "@/types";
import { MapPin, Calendar, Tag } from "lucide-react";
import { resolveImageUrl } from "@/lib/media";

export function ItemCard({ item }: { item: LostItem }) {
  const category = CATEGORIES.find((c) => c.value === item.category);

  return (
    <Card className="hover:shadow-md transition-shadow border-border/60">
      <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate">{item.itemName}</h3>
          <p className="text-xs text-muted-foreground font-mono">{item.refId}</p>
        </div>
        <StatusBadge status={item.status} />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {item.imageUrl && (
          <ImageHoverPreview
            src={resolveImageUrl(item.imageUrl)}
            alt={item.itemName}
            triggerClassName="h-36 w-full rounded-md border object-cover cursor-zoom-in"
          />
        )}
        <p className="text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {item.location}
          </span>
          {item.locationCoordinates && (
            <CoordinateMapHover
              lat={item.locationCoordinates.lat}
              lng={item.locationCoordinates.lng}
              triggerText="View map"
              className="underline underline-offset-2 decoration-dotted"
            />
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {item.dateLost}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> {category?.label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
