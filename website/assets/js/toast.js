export function showToast(
  message = "Done ✔"
) {
  const toast =
    document.getElementById("toast");

  if (!toast) return;

  toast.textContent =
    message;

  toast.classList.add(
    "show"
  );

  setTimeout(() => {
    toast.classList.remove(
      "show"
    );
  }, 1400);
}