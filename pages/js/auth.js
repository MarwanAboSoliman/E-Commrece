function getUser() {
  const data = localStorage.getItem("user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem("user");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toastId = "toast-" + Date.now();
  const bgClass = type === "danger" ? "bg-danger" : type === "warning" ? "bg-warning" : "bg-success";
  const textClass = type === "warning" ? "text-dark" : "text-white";

  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClass} ${textClass} border-0" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", toastHtml);

  const toastEl = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

function setLoading(button, loading) {
  if (loading) {
    button.dataset.originalHtml = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Loading...`;
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalHtml || button.innerHTML;
  }
}

function showFieldErrors(errors) {
  if (!errors) return;
  Object.keys(errors).forEach((field) => {
    const el = document.getElementById(field + "Error");
    if (el) {
      el.textContent = errors[field].errors.join(", ");
      el.classList.remove("d-none");
    }
  });
}

function clearErrors() {
  document.querySelectorAll(".text-danger.small").forEach((el) => {
    el.classList.add("d-none");
  });
}

export { getUser, setUser, clearUser, showToast, setLoading, showFieldErrors, clearErrors };
