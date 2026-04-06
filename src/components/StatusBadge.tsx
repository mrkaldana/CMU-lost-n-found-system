import { Badge } from "@/components/ui/badge";
import { ItemStatus, STATUS_CONFIG } from "@/types";

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge className={`${config.className} text-xs font-semibold px-2.5 py-0.5 rounded-full border-0`}>
      {config.label}
    </Badge>
  );
}
