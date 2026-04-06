import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { LostItem, ItemStatus, ActivityLog } from "@/types";

interface ItemsContextType {
  items: LostItem[];
  addItem: (item: Omit<LostItem, "id" | "refId" | "dateReported" | "status" | "activityLog">) => void;
  updateItem: (id: string, updates: Partial<LostItem>, actionBy?: string) => void;
  updateStatus: (id: string, status: ItemStatus, foundBy?: string, isAnonymous?: boolean) => void;
  approveItem: (id: string) => void;
  rejectItem: (id: string, reason?: string) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => LostItem | undefined;
  stats: { total: number; pending: number; missing: number; found: number; surrendered: number };
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

const generateRefId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "LF-";
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const STORAGE_KEY = "lost-found-items";

const SAMPLE_ITEMS: LostItem[] = [
  {
    id: "1", refId: "LF-A1B2C3", itemName: "Blue Backpack", description: "Navy blue Jansport backpack with keychain attached", category: "bags", location: "Library - 2nd Floor", dateLost: "2026-04-01", dateReported: "2026-04-02", reportedBy: "Maria Santos", contactEmail: "maria@school.edu", status: "missing",
    activityLog: [{ id: "a1", date: "2026-04-02", action: "Item reported as missing", by: "Maria Santos" }],
  },
  {
    id: "2", refId: "LF-D4E5F6", itemName: "iPhone 15 (Black)", description: "Black iPhone 15 with clear case, cracked screen protector", category: "electronics", location: "Cafeteria", dateLost: "2026-03-28", dateReported: "2026-03-28", reportedBy: "Juan Dela Cruz", contactEmail: "juan@school.edu", status: "found", foundBy: "Guard - Main Gate", dateResolved: "2026-04-03",
    activityLog: [
      { id: "a2", date: "2026-03-28", action: "Item reported as missing", by: "Juan Dela Cruz" },
      { id: "a3", date: "2026-04-03", action: "Item found and returned", by: "Admin" },
    ],
  },
  {
    id: "3", refId: "LF-G7H8I9", itemName: "Scientific Calculator", description: "Casio FX-991ES Plus, has sticker on the back", category: "electronics", location: "Room 301 - Math Lab", dateLost: "2026-04-04", dateReported: "2026-04-04", reportedBy: "Ana Reyes", contactEmail: "ana@school.edu", status: "surrendered", foundBy: "Anonymous", isFoundByAnonymous: true, dateResolved: "2026-04-05",
    activityLog: [
      { id: "a4", date: "2026-04-04", action: "Item reported as missing", by: "Ana Reyes" },
      { id: "a5", date: "2026-04-05", action: "Item surrendered by someone (anonymous)", by: "Admin" },
    ],
  },
];

export function ItemsProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LostItem[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : SAMPLE_ITEMS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: Omit<LostItem, "id" | "refId" | "dateReported" | "status" | "activityLog">) => {
    const newItem: LostItem = {
      ...item,
      id: crypto.randomUUID(),
      refId: generateRefId(),
      dateReported: new Date().toISOString().split("T")[0],
      status: "pending",
      activityLog: [{ id: crypto.randomUUID(), date: new Date().toISOString().split("T")[0], action: "Report submitted — awaiting admin approval", by: item.reportedBy }],
    };
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<LostItem>, actionBy = "Admin") => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const log: ActivityLog = { id: crypto.randomUUID(), date: new Date().toISOString().split("T")[0], action: `Item details updated`, by: actionBy };
        return { ...item, ...updates, activityLog: [...item.activityLog, log] };
      })
    );
  }, []);

  const updateStatus = useCallback((id: string, status: ItemStatus, foundBy?: string, isAnonymous?: boolean) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const actionMap: Record<ItemStatus, string> = {
          missing: "Item marked as missing again",
          found: `Item found and returned`,
          surrendered: `Item surrendered by ${isAnonymous ? "someone (anonymous)" : foundBy || "unknown"}`,
        };
        const log: ActivityLog = { id: crypto.randomUUID(), date: new Date().toISOString().split("T")[0], action: actionMap[status], by: "Admin" };
        return {
          ...item,
          status,
          foundBy: isAnonymous ? "Anonymous" : foundBy,
          isFoundByAnonymous: isAnonymous,
          dateResolved: status !== "missing" ? new Date().toISOString().split("T")[0] : undefined,
          activityLog: [...item.activityLog, log],
        };
      })
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getItem = useCallback((id: string) => items.find((item) => item.id === id), [items]);

  const stats = {
    total: items.length,
    missing: items.filter((i) => i.status === "missing").length,
    found: items.filter((i) => i.status === "found").length,
    surrendered: items.filter((i) => i.status === "surrendered").length,
  };

  return (
    <ItemsContext.Provider value={{ items, addItem, updateItem, updateStatus, deleteItem, getItem, stats }}>
      {children}
    </ItemsContext.Provider>
  );
}

export function useItems() {
  const context = useContext(ItemsContext);
  if (!context) throw new Error("useItems must be used within ItemsProvider");
  return context;
}
