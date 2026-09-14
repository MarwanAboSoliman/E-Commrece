import { z } from "zod";

export const cartItemSchema = z.object({
  id: z.string().min(1, "product id is required"),
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required"),
  price: z.number().positive("price must be positive"),
  image: z.string().url("image must be a valid URL"),
  quantity: z.number().int().positive("quantity must be a positive integer"),
});

// For updating quantity only
export const cartUpdateSchema = z.object({
  quantity: z.number().int().positive("quantity must be a positive integer"),
});
