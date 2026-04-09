import type { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { Item } from "../models/Item";

type AdminStatus = "pending" | "missing" | "found" | "surrendered" | "claimed" | "rejected";
type ClientItemSource = {
  _id: mongoose.Types.ObjectId;
  refId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  locationCoordinates?: { lat?: number; lng?: number };
  dateLost: string;
  dateReported: string;
  reportedByName: string;
  contactEmail: string;
  status: string;
  foundBy?: string;
  isFoundByAnonymous?: boolean;
  dateResolved?: string;
  imageUrl?: string;
  activityLog?: Array<{ id: string; date: string; action: string; by: string }>;
};

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function toClientItem(doc: ClientItemSource) {
  return {
    id: doc._id.toString(),
    refId: doc.refId,
    itemName: doc.title,
    description: doc.description,
    category: doc.category,
    location: doc.location,
    locationCoordinates: doc.locationCoordinates,
    dateLost: doc.dateLost,
    dateReported: doc.dateReported,
    reportedBy: doc.reportedByName,
    contactEmail: doc.contactEmail,
    status: doc.status,
    foundBy: doc.foundBy,
    isFoundByAnonymous: doc.isFoundByAnonymous,
    dateResolved: doc.dateResolved,
    imageUrl: doc.imageUrl,
    activityLog: doc.activityLog ?? []
  };
}

export async function adminGetItems(_req: Request, res: Response) {
  const items = await Item.find().sort({ createdAt: -1 });
  return res.json(items.map(toClientItem));
}

export async function adminGetDashboardStats(_req: Request, res: Response) {
  const docs = await Item.find({}, { status: 1, category: 1, createdAt: 1, dateResolved: 1 }).lean();

  const statusCounts = {
    pending: 0,
    missing: 0,
    found: 0,
    surrendered: 0,
    rejected: 0,
  };

  const categoryMap: Record<string, number> = {};
  const reportsByDateMap = new Map<string, { reports: number; resolved: number }>();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    reportsByDateMap.set(key, { reports: 0, resolved: 0 });
  }

  for (const doc of docs) {
    const status = doc.status as keyof typeof statusCounts;
    if (status in statusCounts) {
      statusCounts[status] += 1;
    }

    categoryMap[doc.category] = (categoryMap[doc.category] ?? 0) + 1;

    const createdDate = new Date(doc.createdAt).toISOString().slice(0, 10);
    const createdBucket = reportsByDateMap.get(createdDate);
    if (createdBucket) {
      createdBucket.reports += 1;
    }

    if (doc.dateResolved) {
      const resolvedBucket = reportsByDateMap.get(doc.dateResolved);
      if (resolvedBucket) {
        resolvedBucket.resolved += 1;
      }
    }
  }

  const totalActive = statusCounts.pending + statusCounts.missing + statusCounts.found + statusCounts.surrendered;
  const resolved = statusCounts.found + statusCounts.surrendered;
  const resolutionRate = totalActive > 0 ? Math.round((resolved / totalActive) * 100) : 0;

  return res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      total: totalActive,
      pending: statusCounts.pending,
      missing: statusCounts.missing,
      found: statusCounts.found,
      surrendered: statusCounts.surrendered,
      rejected: statusCounts.rejected,
      resolved,
      resolutionRate,
    },
    statusBreakdown: [
      { status: "pending", count: statusCounts.pending },
      { status: "missing", count: statusCounts.missing },
      { status: "found", count: statusCounts.found },
      { status: "surrendered", count: statusCounts.surrendered },
      { status: "rejected", count: statusCounts.rejected },
    ],
    categoryBreakdown: Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    reportsPerDay: Array.from(reportsByDateMap.entries()).map(([date, value]) => ({
      date,
      reports: value.reports,
      resolved: value.resolved,
    })),
  });
}

export async function adminUpdateItemStatus(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid item id" });

  const { status, foundBy, isAnonymous, reason } = req.body as {
    status?: string;
    foundBy?: string;
    isAnonymous?: boolean;
    reason?: string;
  };

  if (!status) return res.status(400).json({ message: "status is required" });

  const allowed: AdminStatus[] = ["pending", "missing", "found", "surrendered", "claimed", "rejected"];
  if (!allowed.includes(status as AdminStatus)) return res.status(400).json({ message: "Invalid status" });

  const item = await Item.findById(id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  item.status = status as AdminStatus;

  if (status === "found" || status === "surrendered" || status === "claimed") {
    item.dateResolved = todayISO();
  }

  if (status === "missing") {
    item.dateResolved = undefined;
    item.foundBy = undefined;
    item.isFoundByAnonymous = false;
  }

  if (typeof isAnonymous === "boolean") item.isFoundByAnonymous = isAnonymous;
  if (typeof foundBy === "string") item.foundBy = isAnonymous ? "Anonymous" : foundBy;

  const actionMap: Record<string, string> = {
    pending: "Item set back to pending",
    missing: "Report approved by admin",
    found: "Item found and returned",
    surrendered: `Item surrendered by ${isAnonymous ? "someone (anonymous)" : foundBy || "unknown"}`,
    claimed: "Item claimed by owner",
    rejected: `Report rejected by admin${reason ? ": " + reason : ""}`
  };

  item.activityLog.push({
    id: crypto.randomUUID(),
    date: todayISO(),
    action: actionMap[status] || `Status changed to ${status}`,
    by: "Admin"
  });

  await item.save();
  return res.json(toClientItem(item));
}

