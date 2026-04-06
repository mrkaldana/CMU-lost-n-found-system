import { useState } from "react";
import { useItems } from "@/context/ItemsContext";
import { ItemCard } from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Plus, PackageOpen } from "lucide-react";
import { CATEGORIES, ItemStatus } from "@/types";

const Index = () => {
  const { items } = useItems();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const approvedItems = items.filter((i) => i.status !== "pending" && i.status !== "rejected");

  const filtered = approvedItems.filter((item) => {
    const matchSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.refId.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Lost Something?</h1>
          <p className="text-primary-foreground/80 max-w-md mx-auto">
            Search through reported items or file a new report. We'll help you find it.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/report">
              <Plus className="h-4 w-4 mr-2" /> Report Lost Item
            </Link>
          </Button>
        </div>
      </section>

      {/* Filters */}
      <div className="container py-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ref ID, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="missing">Missing</SelectItem>
              <SelectItem value="found">Found</SelectItem>
              <SelectItem value="surrendered">Surrendered</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} item{filtered.length !== 1 ? "s" : ""} found</p>

        {filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">No items match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
