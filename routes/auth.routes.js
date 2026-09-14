import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { validateBody } from "../middlewares/validateBody.js";
import { registerSchema } from "../schema/auth/register.schema.js";
import { loginSchema } from "../schema/auth/login.schema.js";
import { createDB } from "../db.js";
process.loadEnvFile();
const db = createDB();
export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  //hashPassword
  // const { email, password, username } = req.body;
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  //Check if Email Is already exists
  const auth_users = await db.getAll("auth_users");
  const found_user = auth_users.find((u) => u.email === req.body.email);
  //if Found
  if (found_user) {
    return res.status(422).json({
      errors: {
        email: { errors: ["email already in use"] },
      },
    });
  }
  //Else create The user
  await db.create("auth_users", {
    email: req.body.email,
    username: req.body.username,
    passwordHash: passwordHash,
    role: req.body.role,
  });
  res.status(201).json({
    message: "register successful, you can now login",
  });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  //See if the email exist
  const auth_users = await db.getAll("auth_users");
  const found_user = auth_users.find((u) => u.email === req.body.email);
  if (!found_user) {
    return res.status(422).json({ error: "email or password are invalid" });
  }
  //if email found check is the password match or not
  const isValidPass = await bcrypt.compare(
    req.body.password,
    found_user.passwordHash,
  );
  if (!isValidPass) {
    return res.status(422).json({ error: "email or password are invalid" });
  }
  //generate Token
  const token = jwt.sign(
    {
      id: found_user.id,
      email: found_user.email,
      username: found_user.username,
      role: found_user.role,
    },
    process.env.JWT_SECRET,
  );
  //Generate cookie
  res.cookie("node_api_token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    sameSite: "lax",
  });
  res.status(200).json({
    message: "login successful",
    data: {
      user: {
        id: found_user.id,
        email: found_user.email,
        username: found_user.username,
        role: found_user.role,
      },
    },
  });
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("node_api_token");
  res.json({ message: "logout successful" });
});
