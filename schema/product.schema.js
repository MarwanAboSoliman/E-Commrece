import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required"),
  price: z.number().positive("price must be positive"),
  image: z.string().url("image must be a valid URL").optional().default(""),
});

