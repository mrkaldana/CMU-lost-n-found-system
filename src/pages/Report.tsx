import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useItems } from "@/context/ItemsContext";
import { CATEGORIES, ItemCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PackagePlus } from "lucide-react";

const Report = () => {
  const { addItem } = useItems();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    itemName: "",
    description: "",
    category: "" as ItemCategory | "",
    location: "",
    dateLost: "",
    reportedBy: "",
    contactEmail: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName || !form.category || !form.location || !form.dateLost || !form.reportedBy || !form.contactEmail) {
      toast.error("Please fill in all required fields.");
      return;
    }
    addItem({
      itemName: form.itemName,
      description: form.description,
      category: form.category as ItemCategory,
      location: form.location,
      dateLost: form.dateLost,
      reportedBy: form.reportedBy,
      contactEmail: form.contactEmail,
    });
    toast.success("Report submitted successfully! Your reference ID has been generated.");
    navigate("/");
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PackagePlus className="h-5 w-5 text-primary" />
            <CardTitle>Report a Lost Item</CardTitle>
          </div>
          <CardDescription>Fill in the details below. A unique reference ID will be generated for tracking.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name *</Label>
                <Input id="itemName" placeholder="e.g. Blue Backpack" value={form.itemName} onChange={(e) => update("itemName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Color, brand, identifying marks..." value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Last Seen Location *</Label>
                <Input id="location" placeholder="e.g. Library 2nd Floor" value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateLost">Date Lost *</Label>
                <Input id="dateLost" type="date" value={form.dateLost} onChange={(e) => update("dateLost", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportedBy">Your Name *</Label>
                <Input id="reportedBy" placeholder="Full name" value={form.reportedBy} onChange={(e) => update("reportedBy", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input id="contactEmail" type="email" placeholder="you@school.edu" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1">Submit Report</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
