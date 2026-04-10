import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { LostItem, ItemStatus } from "@/types";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";


interface ItemsContextType {
  items: LostItem[];
  addItem: (
    item: Omit<LostItem, "id" | "refId" | "dateReported" | "status" | "activityLog" | "imageUrl"> & { imageUrl?: string; imageFile?: File },
    options?: { status?: ItemStatus; foundBy?: string; isAnonymous?: boolean; initialStatus?: Extract<ItemStatus, "missing" | "found" | "surrendered"> }
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<LostItem> & { imageFile?: File }) => Promise<void>;
  updateStatus: (id: string, status: ItemStatus, foundBy?: string, isAnonymous?: boolean) => Promise<void>;
  approveItem: (id: string) => Promise<void>;
  rejectItem: (id: string, reason?: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => LostItem | undefined;
  stats: { total: number; pending: number; missing: number; found: number; surrendered: number };
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const { token, isAdmin } = useAuth();
  const [items, setItems] = useState<LostItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiRequest<LostItem[]>("/api/items");
        setItems(data);
      } catch {
        setItems([]);
      }
    };
    void load();
  }, []);

  const refresh = useCallback(async () => {
    const data = await apiRequest<LostItem[]>("/api/items");
    setItems(data);
  }, []);

  const addItem = useCallback(
    async (
      item: Omit<LostItem, "id" | "refId" | "dateReported" | "status" | "activityLog" | "imageUrl"> & { imageUrl?: string; imageFile?: File },
      options?: { status?: ItemStatus; foundBy?: string; isAnonymous?: boolean; initialStatus?: Extract<ItemStatus, "missing" | "found" | "surrendered"> }
    ) => {
      if (!token) throw new Error("Please sign in first.");

      let created: LostItem;
      if (item.imageFile) {
        const formData = new FormData();
        formData.append("itemName", item.itemName);
        formData.append("description", item.description);
        formData.append("category", item.category);
        formData.append("location", item.location);
        formData.append("locationCoordinates", JSON.stringify(item.locationCoordinates));
        formData.append("dateLost", item.dateLost);
        formData.append("reportedBy", item.reportedBy);
        formData.append("contactEmail", item.contactEmail);
        if (options?.initialStatus) formData.append("status", options.initialStatus);
        formData.append("image", item.imageFile);

        created = await apiRequest<LostItem>("/api/items", {
          method: "POST",
          body: formData,
          token,
        });
      } else {
        created = await apiRequest<LostItem>("/api/items", {
          method: "POST",
          body: JSON.stringify({
            ...item,
            status: options?.initialStatus,
          }),
          token,
        });
      }

      // Walk-in reports (admin-only) may immediately set a non-pending status
      const desiredStatus = options?.status;
      if (desiredStatus && desiredStatus !== "pending") {
        if (!isAdmin) throw new Error("Admin access required for walk-in reports.");

        await apiRequest<LostItem>(`/api/admin/items/${created.id}/status`, {
          method: "PUT",
          body: JSON.stringify({
            status: desiredStatus,
            foundBy: options?.foundBy,
            isAnonymous: options?.isAnonymous,
          }),
          token,
        });
      }

      await refresh();
    },
    [token, isAdmin, refresh]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<LostItem> & { imageFile?: File }) => {
      if (!token) throw new Error("Please sign in first.");
      if (updates.imageFile) {
        const formData = new FormData();
        if (typeof updates.itemName === "string") formData.append("itemName", updates.itemName);
        if (typeof updates.description === "string") formData.append("description", updates.description);
        if (typeof updates.category === "string") formData.append("category", updates.category);
        if (typeof updates.location === "string") formData.append("location", updates.location);
        if (typeof updates.dateLost === "string") formData.append("dateLost", updates.dateLost);
        if (typeof updates.reportedBy === "string") formData.append("reportedBy", updates.reportedBy);
        if (typeof updates.contactEmail === "string") formData.append("contactEmail", updates.contactEmail);
        if (updates.locationCoordinates) formData.append("locationCoordinates", JSON.stringify(updates.locationCoordinates));
        formData.append("image", updates.imageFile);
        await apiRequest<LostItem>(`/api/items/${id}`, { method: "PUT", body: formData, token });
      } else {
        await apiRequest<LostItem>(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(updates), token });
      }
      await refresh();
    },
    [token, refresh]
  );

  const updateStatus = useCallback(
    async (id: string, status: ItemStatus, foundBy?: string, isAnonymous?: boolean) => {
      if (!token) throw new Error("Please sign in first.");
      if (!isAdmin) throw new Error("Admin access required.");
      await apiRequest<LostItem>(`/api/admin/items/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, foundBy, isAnonymous }),
        token,
      });
      await refresh();
    },
    [token, isAdmin, refresh]
  );

  const approveItem = useCallback(
    async (id: string) => {
      await updateStatus(id, "missing");
    },
    [updateStatus]
  );

  const rejectItem = useCallback(
    async (id: string, reason?: string) => {
      if (!token) throw new Error("Please sign in first.");
      if (!isAdmin) throw new Error("Admin access required.");
      await apiRequest<LostItem>(`/api/admin/items/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: "rejected", reason }),
        token,
      });
      await refresh();
    },
    [token, isAdmin, refresh]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Please sign in first.");
      await apiRequest<{ message: string }>(`/api/items/${id}`, { method: "DELETE", token });
      await refresh();
    },
    [token, refresh]
  );

  const getItem = useCallback((id: string) => items.find((item) => item.id === id), [items]);

  const stats = {
    total: items.filter((i) => i.status !== "rejected").length,
    pending: items.filter((i) => i.status === "pending").length,
    missing: items.filter((i) => i.status === "missing").length,
    found: items.filter((i) => i.status === "found").length,
    surrendered: items.filter((i) => i.status === "surrendered").length,
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem, updateStatus, approveItem, rejectItem, deleteItem, getItem, stats }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (!context) throw new Error("useItems must be used within ItemsProvider");
  return context;
}
