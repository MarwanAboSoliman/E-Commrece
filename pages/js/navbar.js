import { getUser, clearUser } from "./auth.js";

function renderNavbar() {
  const user = getUser();
  const currentPath = window.location.pathname;

  let links = "";

  if (!user) {
    links = `
      <a class="nav-link ${currentPath === "/products.html" ? "active" : ""}" href="/products.html">Products</a>
      <a class="nav-link ${currentPath === "/login.html" ? "active" : ""}" href="/login.html">Login</a>
      <a class="nav-link ${currentPath === "/register.html" ? "active" : ""}" href="/register.html">Register</a>
    `;
  } else if (user.role === "customer") {
    links = `
      <a class="nav-link ${currentPath === "/home.html" ? "active" : ""}" href="/home.html">Home</a>
      <a class="nav-link ${currentPath === "/products.html" ? "active" : ""}" href="/products.html">Products</a>
      <a class="nav-link ${currentPath === "/cart.html" ? "active" : ""}" href="/cart.html">Cart</a>
      <a class="nav-link ${currentPath === "/orders.html" ? "active" : ""}" href="/orders.html">Orders</a>
    `;
  } else if (user.role === "merchant") {
    links = `
      <a class="nav-link ${currentPath === "/home.html" ? "active" : ""}" href="/home.html">Home</a>
      <a class="nav-link ${currentPath === "/merchant/products.html" ? "active" : ""}" href="/merchant/products.html">My Products</a>
      <a class="nav-link ${currentPath === "/merchant/product-form.html" ? "active" : ""}" href="/merchant/product-form.html">New Product</a>
    `;
  }

  const navbarHtml = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="/home.html">E-Commerce</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            ${links.split("\n").filter(l => l.trim()).map(l => `<li class="nav-item">${l.trim()}</li>`).join("\n            ")}
          </ul>
          ${
            user
              ? `<span class="navbar-text me-3">${user.username} (${user.role})</span>
                 <button class="btn btn-outline-light btn-sm" id="navLogoutBtn">Logout</button>`
              : ""
          }
        </div>
      </div>
    </nav>
  `;

  const placeholder = document.getElementById("navbar");
  if (placeholder) {
    placeholder.innerHTML = navbarHtml;
  }

  const logoutBtn = document.getElementById("navLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch("/auth/logout", { method: "POST" });
      clearUser();
      window.location.href = "/login.html";
    });
  }
}

renderNavbar();
