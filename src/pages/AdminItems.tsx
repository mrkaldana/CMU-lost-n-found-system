import { useState } from "react";
import { useItems } from "@/context/ItemsContext";
import { StatusBadge } from "@/components/StatusBadge";
import { LostItem, ItemStatus, CATEGORIES, ItemCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, ArrowRightLeft, Trash2, Search, Clock, ChevronLeft, CheckCircle, XCircle, Plus } from "lucide-react";
import { WalkInDialog } from "@/components/WalkInDialog";
import { Link } from "react-router-dom";

function EditDialog({ item, open, onClose }: { item: LostItem; open: boolean; onClose: () => void }) {
  const { updateItem } = useItems();
  const [form, setForm] = useState({ itemName: item.itemName, description: item.description, category: item.category, location: item.location });

  const handleSave = () => {
    updateItem(item.id, form);
    toast.success("Item updated.");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item — {item.refId}</DialogTitle>
          <DialogDescription>Update the item details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Item Name</Label>
            <Input value={form.itemName} onChange={(e) => setForm((p) => ({ ...p, itemName: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v as ItemCategory }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">Save Changes</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusDialog({ item, open, onClose }: { item: LostItem; open: boolean; onClose: () => void }) {
  const { updateStatus } = useItems();
  const [status, setStatus] = useState<ItemStatus>(item.status);
  const [foundBy, setFoundBy] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSave = () => {
    updateStatus(item.id, status, foundBy, isAnonymous);
    toast.success(`Status updated to "${status}".`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status — {item.refId}</DialogTitle>
          <DialogDescription>Change the current status of this item.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>New Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ItemStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="missing">Missing</SelectItem>
                <SelectItem value="found">Found</SelectItem>
                <SelectItem value="surrendered">Surrendered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === "found" || status === "surrendered") && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox id="anon" checked={isAnonymous} onCheckedChange={(c) => setIsAnonymous(c === true)} />
                <Label htmlFor="anon" className="text-sm">Person wants to remain anonymous</Label>
              </div>
              {!isAnonymous && (
                <div className="space-y-1">
                  <Label>Found / Surrendered By</Label>
                  <Input placeholder="Name of the person" value={foundBy} onChange={(e) => setFoundBy(e.target.value)} />
                </div>
              )}
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">Update Status</Button>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ActivityDialog({ item, open, onClose }: { item: LostItem; open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activity Log — {item.refId}</DialogTitle>
          <DialogDescription>{item.itemName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {item.activityLog.map((log) => (
            <div key={log.id} className="flex gap-3 items-start">
              <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
              <div>
                <p className="text-sm text-foreground">{log.action}</p>
                <p className="text-xs text-muted-foreground">{log.date} · by {log.by}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AdminItems = () => {
  const { items, deleteItem, approveItem, rejectItem } = useItems();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editItem, setEditItem] = useState<LostItem | null>(null);
  const [statusItem, setStatusItem] = useState<LostItem | null>(null);
  const [activityItem, setActivityItem] = useState<LostItem | null>(null);
  const [walkInOpen, setWalkInOpen] = useState(false);

  const filtered = items.filter((i) => {
    const matchSearch =
      i.itemName.toLowerCase().includes(search.toLowerCase()) ||
      i.refId.toLowerCase().includes(search.toLowerCase()) ||
      i.reportedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = (item: LostItem) => {
    if (confirm(`Delete "${item.itemName}" (${item.refId})?`)) {
      deleteItem(item.id);
      toast.success("Item deleted.");
    }
  };

  const handleApprove = (item: LostItem) => {
    approveItem(item.id);
    toast.success(`Report "${item.itemName}" approved.`);
  };

  const handleReject = (item: LostItem) => {
    if (confirm(`Reject report "${item.itemName}" (${item.refId})?`)) {
      rejectItem(item.id);
      toast.success(`Report "${item.itemName}" rejected.`);
    }
  };

  return (
    <div className="container py-8 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin"><ChevronLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Manage Items</h1>
          <p className="text-muted-foreground text-sm">{items.length} total reports</p>
        </div>
        <Button onClick={() => setWalkInOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Walk-in Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
            <SelectItem value="found">Found</SelectItem>
            <SelectItem value="surrendered">Surrendered</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ref ID</TableHead>
              <TableHead>Item</TableHead>
              <TableHead className="hidden md:table-cell">Reported By</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-xs">{item.refId}</TableCell>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">{item.reportedBy}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{item.dateReported}</TableCell>
                <TableCell><StatusBadge status={item.status} /></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {item.status === "pending" ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => handleApprove(item)} title="Approve" className="text-status-found hover:text-status-found">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleReject(item)} title="Reject" className="text-destructive hover:text-destructive">
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setEditItem(item)} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setStatusItem(item)} title="Update Status">
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setActivityItem(item)} title="Activity Log">
                      <Clock className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item)} title="Delete" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No items found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {editItem && <EditDialog item={editItem} open={!!editItem} onClose={() => setEditItem(null)} />}
      {statusItem && <StatusDialog item={statusItem} open={!!statusItem} onClose={() => setStatusItem(null)} />}
      {activityItem && <ActivityDialog item={activityItem} open={!!activityItem} onClose={() => setActivityItem(null)} />}
      <WalkInDialog open={walkInOpen} onClose={() => setWalkInOpen(false)} />
    </div>
  );
};

export default AdminItems;
