import { createDB } from "../db.js";
import { Router } from "express";
const db = createDB();
export const debugRouter = Router();

debugRouter.get("/", async (req, res) => {
  const auth = await db.getAll("auth_users");
  const products = await db.getAll("products");
  const carts = await db.getAll("carts");
  const orders = await db.getAll("orders");
  res.status(200).json({
    auth_users: auth,
    products: products,
    carts: carts,
    orders: orders,
  });
});
