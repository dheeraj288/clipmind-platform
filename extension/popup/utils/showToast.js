export function showToast(toastEl, message = "Copied ✔") {
  toastEl.textContent = message;
  toastEl.classList.add("show");

  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1200);
}