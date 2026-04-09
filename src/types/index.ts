export type ItemStatus = "pending" | "missing" | "found" | "surrendered" | "rejected";

export type ItemCategory = "electronics" | "clothing" | "accessories" | "books" | "bags" | "sports" | "other";

export interface ActivityLog {
  id: string;
  date: string;
  action: string;
  by: string;
}

export interface ItemCoordinates {
  lat: number;
  lng: number;
}

export interface LostItem {
  id: string;
  refId: string;
  itemName: string;
  description: string;
  category: ItemCategory;
  location: string;
  locationCoordinates?: ItemCoordinates;
  dateLost: string;
  dateReported: string;
  reportedBy: string;
  contactEmail: string;
  status: ItemStatus;
  foundBy?: string;
  isFoundByAnonymous?: boolean;
  dateResolved?: string;
  imageUrl?: string;
  activityLog: ActivityLog[];
}

export const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "accessories", label: "Accessories" },
  { value: "books", label: "Books & Documents" },
  { value: "bags", label: "Bags & Wallets" },
  { value: "sports", label: "Sports Equipment" },
  { value: "other", label: "Other" },
];

export const STATUS_CONFIG: Record<ItemStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-status-pending text-primary-foreground" },
  missing: { label: "Missing", className: "bg-status-missing text-primary-foreground" },
  found: { label: "Found", className: "bg-status-found text-primary-foreground" },
  surrendered: { label: "Surrendered", className: "bg-status-surrendered text-primary-foreground" },
  rejected: { label: "Rejected", className: "bg-destructive text-destructive-foreground" },
};
