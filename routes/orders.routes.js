import { Router } from "express";
import { createDB } from "../db.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import { checkRole } from "../middlewares/checkRole.js";
export const ordersRouter = Router();
const db = createDB();

ordersRouter.post(
  "/checkout",
  checkAuth,
  checkRole("customer"),
  async (req, res) => {
    //get the userId and it's cart
    const userID = req.user.id;
    const cart = await db.getOne("carts", { userID });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Empty Cart",
      });
    }
    //calc the total prices if the products
    let total = 0;
    cart.items.forEach((item) => {
      total += item.price * item.quantity;
    });

    //create the order
    const order = await db.create("orders", {
      userID,
      items: cart.items,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    //clear the current user cart
    cart.items = [];
    await db.update("carts", cart.id, cart);
    res.status(200).json({
      message: "Checkout successful",
      data: order,
    });
  },
);

ordersRouter.get("/", checkAuth, checkRole("customer"), async (req, res) => {
  const userID = req.user.id;
  const orders = await db.getAll("orders");
  const userOrders = orders.filter((o) => o.userID === userID);

  const data = userOrders.map((order) => ({
    id: order.id,
    userId: order.userID,
    products: order.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
    })),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt,
  }));

  res.status(200).json({ data });
});
