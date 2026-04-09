import { Router } from "express";
import { createItem, deleteItem, getItemById, getItems, updateItem } from "../controllers/itemsController";
import { requireAuth } from "../middleware/auth";

export const itemsRouter = Router();

itemsRouter.get("/", getItems);
itemsRouter.post("/", requireAuth, createItem);
itemsRouter.get("/:id", getItemById);
itemsRouter.put("/:id", requireAuth, updateItem);
itemsRouter.delete("/:id", requireAuth, deleteItem);

