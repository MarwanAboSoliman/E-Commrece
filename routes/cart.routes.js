import { Router } from "express";
import { createDB } from "../db.js";
import { validateBody } from "../middlewares/validateBody.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import { checkRole } from "../middlewares/checkRole.js";
import { cartItemSchema, cartUpdateSchema } from "../schema/cart.schema.js";

export const cartRouter = Router();
const db = createDB();

cartRouter.get("/", checkAuth, checkRole("customer"), async (req, res) => {
  //get the user id from req
  const userId = req.user.id;
  //find the cart of the specfied user
  const cart = await db.getOne("carts", { userID: userId });
  //if no cart
  if (!cart) {
    return res.status(200).json({
      data: {
        id: null,
        products: [],
      },
    });
  }
  //if there is a cart show the items one by one(object by object)
  const products = cart.items.map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    price: i.price,
    image: i.image,
    quantity: i.quantity,
  }));
  res.status(200).json({
    data: {
      id: cart.id,
      userID: userId,
      products: products,
    },
  });
});

cartRouter.post(
  "/",
  checkAuth,
  checkRole("customer"),
  validateBody(cartItemSchema),
  async (req, res) => {
    //get the user id from req
    const userID = req.user.id;
    //data of the products
    const { id, name, description, price, image, quantity } = req.body;
    //find the cart of the specfied user
    let cart = await db.getOne("carts", { userID });
    //if no cart create new one
    if (!cart) {
      cart = await db.create("carts", { userID, items: [] });
    }
    //if there is items in the cart and the user wants to add them again
    const existingProducts = cart.items.find((i) => i.id === id);
    if (existingProducts) {
      //inc the quantity of the item if exist
      existingProducts.quantity += quantity;
    } else {
      //if the item new to the cart add it
      cart.items.push({ id, name, description, price, image, quantity });
    }

    //update

    await db.update("carts", cart.id, cart);

    const products = cart.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
    }));

    res.status(200).json({
      message: "Product added to cart",
      data: {
        id: cart.id,
        userID,
        products,
      },
    });
  },
);

cartRouter.patch(
  "/:productId",
  checkAuth,
  checkRole("customer"),
  validateBody(cartUpdateSchema),
  async (req, res) => {
    const userID = req.user.id;
    const { quantity } = req.body;
    const { productId } = req.params;

    const cart = await db.getOne("carts", { userID });
    if (!cart) {
      return res.status(404).json({
        message: "Cart not Found",
      });
    }
    //find the product in the cart
    const updatedItem = cart.items.find((i) => i.id === productId);
    if (!updatedItem) {
      return res.status(404).json({
        message: "Product not in cart",
      });
    }

    //update the product quantity
    updatedItem.quantity = quantity;
    await db.update("carts", cart.id, cart);
    const products = cart.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
    }));
    res.status(200).json({
      message: "cart updated",
      data: {
        id: cart.id,
        userID,
        products,
      },
    });
  },
);

cartRouter.delete(
  "/:productId",
  checkAuth,
  checkRole("customer"),
  async (req, res) => {
    const userID = req.user.id;
    const { productId } = req.params;
    const cart = await db.getOne("carts", { userID });
    if (!cart) {
      return res.status(404).json({
        message: "Cart Not found",
      });
    }

    //delete item
    const itemIndex = cart.items.findIndex((i) => i.id === productId);
    if (itemIndex === -1) {
      return res.status(404).json({
        message: "item not dound in the cart",
      });
    }
    cart.items.splice(itemIndex, 1);

    //update
    await db.update("carts", cart.id, cart);

    const products = cart.items.map((i) => ({
      id: i.id,
      name: i.name,
      description: i.description,
      price: i.price,
      image: i.image,
      quantity: i.quantity,
    }));
    res.status(200).json({
      message: "product removed from cart",
      data: {
        id: cart.id,
        userID,
        products,
      },
    });
  },
);
