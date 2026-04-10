import { getApiUrl } from "@/lib/api";

export function resolveImageUrl(imageUrl?: string) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("/")) return `${getApiUrl()}${imageUrl}`;
  return imageUrl;
}
