import z from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(2),
    email: z.email(),
    password: z
      .string()
      .min(8)
      .regex(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "password must contain at least 1 capital letter, 1 small latter, 1 digit, and 1 special character",
      ),
    password_confirmation: z
      .string()
      .min(8)
      .regex(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "password must contain at least 1 capital letter, 1 small latter, 1 digit, and 1 special character",
      ),
    role: z.enum(["customer", "merchant"]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    error: "password do not match",
    path: ["password_confirmation"],
  });
