import type { Request, Response } from "express";
import crypto from "crypto";
import mongoose from "mongoose";
import { Item } from "../models/Item";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function generateRefId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "LF-";
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

function parseCoordinates(coords: unknown) {
  if (typeof coords === "string") {
    try {
      const parsed = JSON.parse(coords) as unknown;
      return parseCoordinates(parsed);
    } catch {
      return undefined;
    }
  }
  if (!coords || typeof coords !== "object") return undefined;
  const source = coords as { lat?: unknown; lng?: unknown };
  if (typeof source.lat !== "number" || typeof source.lng !== "number") return undefined;
  return { lat: source.lat, lng: source.lng };
}

function toClientItem(doc: any) {
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

export async function getItems(_req: Request, res: Response) {
  const items = await Item.find({ status: { $ne: "rejected" } }).sort({ createdAt: -1 });
  return res.json(items.map(toClientItem));
}

export async function getItemById(req: Request, res: Response) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid item id" });

  const item = await Item.findById(id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  return res.json(toClientItem(item));
}

export async function createItem(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  const body = req.body as Partial<{
    itemName: string;
    title: string;
    description: string;
    category: string;
    location: string;
    locationCoordinates?: { lat: number; lng: number };
    dateLost: string;
    imageUrl?: string;
    reportedBy?: string;
    contactEmail?: string;
    status?: "missing" | "found" | "surrendered";
  }>;
  const uploadedImageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  const title = (body.title || body.itemName || "").trim();
  if (!title || !body.description || !body.category || !body.location || !body.dateLost) {
    return res.status(400).json({ message: "title/itemName, description, category, location, dateLost are required" });
  }

  const locationCoordinates = parseCoordinates(body.locationCoordinates);
  if (!locationCoordinates) {
    return res.status(400).json({ message: "locationCoordinates (lat, lng) are required" });
  }

  const requestedStatus = body.status;
  const initialStatus = requestedStatus === "found" || requestedStatus === "surrendered" ? requestedStatus : "missing";
  const initialAction = initialStatus === "missing" ? "Item reported as missing" : initialStatus === "found" ? "Item reported as found" : "Item reported as surrendered";

  const now = todayISO();
  const activityLog = [
    {
      id: crypto.randomUUID(),
      date: now,
      action: initialAction,
      by: body.reportedBy || req.user.name
    }
  ];

  // Ensure refId uniqueness with a few attempts
  let refId = generateRefId();
  for (let i = 0; i < 5; i++) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await Item.exists({ refId });
    if (!exists) break;
    refId = generateRefId();
  }

  const created = await Item.create({
    refId,
    title,
    description: body.description,
    category: body.category,
    status: initialStatus,
    location: body.location,
    locationCoordinates,
    dateLost: body.dateLost,
    dateReported: now,
    reportedBy: req.user.id,
    reportedByName: body.reportedBy || req.user.name,
    contactEmail: (body.contactEmail || req.user.email).toLowerCase(),
    imageUrl: uploadedImageUrl || body.imageUrl,
    activityLog
  });

  return res.status(201).json(toClientItem(created));
}

export async function updateItem(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid item id" });

  const item = await Item.findById(id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const isOwner = item.reportedBy.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

  const updates = req.body as Partial<{
    itemName: string;
    title: string;
    description: string;
    category: string;
    location: string;
    locationCoordinates?: { lat: number; lng: number };
    dateLost: string;
    imageUrl?: string;
    reportedBy?: string;
    contactEmail?: string;
  }>;
  const uploadedImageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  if (typeof updates.title === "string" || typeof updates.itemName === "string") {
    const nextTitle = (updates.title || updates.itemName || "").trim();
    if (nextTitle) item.title = nextTitle;
  }
  if (typeof updates.description === "string") item.description = updates.description;
  if (typeof updates.category === "string") item.category = updates.category;
  if (typeof updates.location === "string") item.location = updates.location;
  if ("locationCoordinates" in updates) {
    const nextCoords = parseCoordinates(updates.locationCoordinates);
    if (nextCoords) item.locationCoordinates = nextCoords;
  }
  if (typeof updates.dateLost === "string") item.dateLost = updates.dateLost;
  if (typeof updates.imageUrl === "string") item.imageUrl = updates.imageUrl;
  if (uploadedImageUrl) item.imageUrl = uploadedImageUrl;

  if (typeof updates.reportedBy === "string" && updates.reportedBy.trim()) item.reportedByName = updates.reportedBy.trim();
  if (typeof updates.contactEmail === "string" && updates.contactEmail.trim()) item.contactEmail = updates.contactEmail.trim().toLowerCase();

  item.activityLog.push({
    id: crypto.randomUUID(),
    date: todayISO(),
    action: "Item details updated",
    by: isAdmin ? "Admin" : item.reportedByName
  });

  await item.save();
  return res.json(toClientItem(item));
}

export async function deleteItem(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: "Invalid item id" });

  const item = await Item.findById(id);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const isOwner = item.reportedBy.toString() === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ message: "Not allowed" });

  await item.deleteOne();
  return res.json({ message: "Deleted" });
}

