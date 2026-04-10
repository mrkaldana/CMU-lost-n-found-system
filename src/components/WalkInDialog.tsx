import { useState } from "react";
import { useItems } from "@/context/ItemsContext";
import { ItemStatus, ItemCategory, CATEGORIES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationPickerMap } from "@/components/LocationPickerMap";
import { toast } from "sonner";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

interface WalkInDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WalkInDialog({ open, onClose }: WalkInDialogProps) {
  const { addItem } = useItems();
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    category: "other" as ItemCategory,
    location: "",
    locationCoordinates: undefined as { lat: number; lng: number } | undefined,
    dateLost: new Date().toISOString().split("T")[0],
    reportedBy: "",
    contactEmail: "",
    imagePreviewUrl: "",
    imageFile: undefined as File | undefined,
    status: "missing" as ItemStatus,
    foundBy: "",
    isAnonymous: false,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image size must be 5MB or less.");
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, imagePreviewUrl: objectUrl, imageFile: file }));
  };

  const handleSubmit = async () => {
    if (!form.itemName || !form.location || !form.locationCoordinates || !form.reportedBy) {
      toast.error("Please fill in required fields (Item Name, Location, Pin, Reported By).");
      return;
    }

    try {
      await addItem(
        {
          itemName: form.itemName,
          description: form.description,
          category: form.category,
          location: form.location,
          locationCoordinates: form.locationCoordinates,
          dateLost: form.dateLost,
          reportedBy: form.reportedBy,
          contactEmail: form.contactEmail,
          imageFile: form.imageFile,
        },
        {
          status: form.status,
          foundBy: form.foundBy,
          isAnonymous: form.isAnonymous,
        }
      );

      toast.success(`Walk-in report added as "${form.status}".`);
      onClose();
      setForm({
        itemName: "",
        description: "",
        category: "other",
        location: "",
        locationCoordinates: undefined,
        dateLost: new Date().toISOString().split("T")[0],
        reportedBy: "",
        contactEmail: "",
        imagePreviewUrl: "",
        imageFile: undefined,
        status: "missing",
        foundBy: "",
        isAnonymous: false,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add report.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Walk-in Report</DialogTitle>
          <DialogDescription>Manually add a report for items brought in person.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Item Name *</Label>
            <Input value={form.itemName} onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value }))} placeholder="e.g. Blue Backpack" />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Describe the item..." />
          </div>
          <div className="space-y-1">
            <Label htmlFor="walkin-item-image">Item Image</Label>
            <Input id="walkin-item-image" type="file" accept="image/*" onChange={handleImageChange} />
            {form.imagePreviewUrl && (
              <img
                src={form.imagePreviewUrl}
                alt="Item preview"
                className="h-36 w-full max-w-xs rounded-md border object-cover"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as ItemCategory }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as ItemStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="missing">Missing</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                  <SelectItem value="surrendered">Surrendered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Location *</Label>
            <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="Where it was lost/found" />
          </div>
          <div className="space-y-1">
            <Label>Pin Exact Location *</Label>
            <LocationPickerMap
              value={form.locationCoordinates}
              onChange={(coords) => setForm((p) => ({ ...p, locationCoordinates: coords }))}
            />
            <p className="text-xs text-muted-foreground">
              Click on the map to set the exact spot.
              {form.locationCoordinates ? ` Selected: ${form.locationCoordinates.lat}, ${form.locationCoordinates.lng}` : ""}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Date Lost</Label>
            <Input type="date" value={form.dateLost} onChange={(e) => setForm((p) => ({ ...p, dateLost: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Reported By *</Label>
              <Input value={form.reportedBy} onChange={(e) => setForm((p) => ({ ...p, reportedBy: e.target.value }))} placeholder="Person's name" />
            </div>
            <div className="space-y-1">
              <Label>Contact Email</Label>
              <Input type="email" value={form.contactEmail} onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))} placeholder="Optional" />
            </div>
          </div>

          {(form.status === "found" || form.status === "surrendered") && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox id="walkin-anon" checked={form.isAnonymous} onCheckedChange={(c) => setForm((p) => ({ ...p, isAnonymous: c === true }))} />
                <Label htmlFor="walkin-anon" className="text-sm">Finder wants to remain anonymous</Label>
              </div>
              {!form.isAnonymous && (
                <div className="space-y-1">
                  <Label>Found / Surrendered By</Label>
                  <Input value={form.foundBy} onChange={(e) => setForm((p) => ({ ...p, foundBy: e.target.value }))} placeholder="Name of the person" />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} className="flex-1">Add Report</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
