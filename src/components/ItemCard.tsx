import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { LostItem, CATEGORIES } from "@/types";
import { MapPin, Calendar, Tag } from "lucide-react";

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
        <p className="text-muted-foreground line-clamp-2">{item.description}</p>
        <div className="flex flex-wrap gap-3 text-muted-foreground text-xs">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {item.location}
          </span>
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
