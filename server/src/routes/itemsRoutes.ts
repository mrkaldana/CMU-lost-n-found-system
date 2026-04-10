import { Router } from "express";
import { createItem, deleteItem, getItemById, getItems, updateItem } from "../controllers/itemsController";
import { requireAuth } from "../middleware/auth";
import { uploadImage } from "../middleware/upload";

export const itemsRouter = Router();

itemsRouter.get("/", getItems);
itemsRouter.post("/", requireAuth, uploadImage.single("image"), createItem);
itemsRouter.get("/:id", getItemById);
itemsRouter.put("/:id", requireAuth, uploadImage.single("image"), updateItem);
itemsRouter.delete("/:id", requireAuth, deleteItem);

