// ============================================================
// DO NOT MODIFY THIS FILE
// This file handles all page routes and static file serving.
// ============================================================

import express from "express";
import jwt from "jsonwebtoken";

process.loadEnvFile();

export const pagesRouter = express.Router();

function pageAuth(req, res, next) {
  const token = req.cookies.node_api_token;
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.redirect("/login.html");
  }
}

function pageRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.redirect("/login.html");
    }
    next();
  };
}

pagesRouter.get("/home.html", pageAuth, (req, res) => {
  res.sendFile("pages/home.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/cart.html", pageAuth, pageRole("customer"), (req, res) => {
  res.sendFile("pages/cart.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/orders.html", pageAuth, pageRole("customer"), (req, res) => {
  res.sendFile("pages/orders.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/merchant/products.html", pageAuth, pageRole("merchant"), (req, res) => {
  res.sendFile("pages/merchant/products.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.get("/merchant/product-form.html", pageAuth, pageRole("merchant"), (req, res) => {
  res.sendFile("pages/merchant/product-form.html", { root: import.meta.dirname + "/.." });
});

pagesRouter.use(express.static("pages"));

pagesRouter.use((req, res) => {
  res.status(404).sendFile("pages/404.html", { root: import.meta.dirname + "/.." });
});
