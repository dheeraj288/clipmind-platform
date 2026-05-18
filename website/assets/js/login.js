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

if (getToken()) {
  window.location.href =
    "dashboard.html";
}

form.addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    message.textContent =
      "Logging in...";

    try {
      await loginUser(
        emailInput.value,
        passwordInput.value
      );

      window.location.href =
        "dashboard.html";

    } catch (err) {
      message.textContent =
        err.message || "Login failed";
    }
  }
);