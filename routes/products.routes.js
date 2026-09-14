import { Router } from "express";
import { productSchema } from "../schema/product.schema.js";
import { createDB } from "../db.js";
import { validateBody } from "../middlewares/validateBody.js";
import { checkAuth } from "../middlewares/checkAuth.js";
import { checkRole } from "../middlewares/checkRole.js";
const db = createDB();
export const productsRouter = Router();

productsRouter.get("/", async (req, res) => {
  const search = req.query.search;
  let products;
  if (search) {
    products = await db.search("products", search);
  } else {
    products = await db.getAll("products");
  }
  res.status(200).json({
    data: products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image || "",
    })),
  });
});

productsRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  //Search For the products
  const product = await db.getById("products", id);
  //if not found
  if (!product) {
    return res.status(404).json({
      error: "product not found",
    });
  }
  res.status(200).json({
    data: {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image || "",
    },
  });
});

productsRouter.post(
  "/",
  checkAuth,
  checkRole("merchant"),
  validateBody(productSchema),
  async (req, res) => {
    const { name, description, price, image } = req.body;
    const product = await db.create("products", {
      name: name,
      description: description,
      price: Number(price),
      image: image || "",
    });

    res.status(201).json({
      message: "product created successfully",
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image || "",
      },
    });
  },
);

productsRouter.patch(
  "/:id",
  checkAuth,
  checkRole("merchant"),
  validateBody(productSchema.partial()),
  async (req, res) => {
    const id = req.params.id;
    const update = req.body;
    //Search For the products wanted to be modified
    const product = await db.getById("products", id);
    //if not found products
    if (!product) {
      return res.status(404).json({ error: "Not found" });
    }
    await db.update("products", id, update);

    //puted the updated product in a variable to be easy to use
    const updatedProduct = await db.getById("products", id);
    res.status(200).json({
      message: "product updated successfully",
      data: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        image: updatedProduct.image || "",
      },
    });
  },
);

productsRouter.delete(
  "/:id",
  checkAuth,
  checkRole("merchant"),
  async (req, res) => {
    const id = req.params.id;
    const product = await db.getById("products", id);
    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }
    await db.delete("products", id);
    res.status(204);
  },
);
