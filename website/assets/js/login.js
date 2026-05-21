import {
  loginUser,
  getToken,
} from "./api.js";

const form =
  document.getElementById("login-form");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const message =
  document.getElementById("message");

const submitBtn =
  form?.querySelector("button");

/* Already logged in */
if (getToken()) {
  window.location.href =
    "dashboard.html";
}

function setMessage(text = "", type = "error") {
  message.textContent = text;

  message.className =
    type === "success"
      ? "auth-message success"
      : "auth-message error";
}

function setLoading(isLoading) {
  if (!submitBtn) return;

  submitBtn.disabled =
    isLoading;

  submitBtn.textContent =
    isLoading
      ? "Logging in..."
      : "Login";
}

form?.addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value.trim();

    if (!email || !password) {
      setMessage(
        "Email and password are required"
      );

      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await loginUser(
        email,
        password
      );

      setMessage(
        "Login successful ✅",
        "success"
      );

      window.location.href =
        "dashboard.html";

    } catch (err) {
      console.error(err);

      setMessage(
        "Invalid email or password"
      );

    } finally {
      setLoading(false);
    }
  }
);