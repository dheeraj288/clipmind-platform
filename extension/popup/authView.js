import {
  loginUser,
  signupUser,
} from "../services/auth.js";

export function renderAuth(container, onSuccess) {
  container.innerHTML = `
<div class="auth-screen">

  <div class="auth-card">

    <div class="auth-top">

      <div class="auth-logo">
        📋
      </div>

      <h1>Clipboard Pro</h1>

      <p class="auth-subtitle">
        Smart cloud clipboard manager
      </p>

    </div>

    <div class="auth-form">

      <div class="input-group">
        <input type="email" id="email" placeholder="Enter email" />
      </div>

      <div class="input-group">
        <input type="password" id="password" placeholder="Enter password" />
      </div>

      <button id="login-btn" class="primary-btn">
        Login
      </button>

      <button id="signup-btn" class="secondary-btn">
        Create Account
      </button>

      <div id="auth-error" class="auth-error"></div>

    </div>

  </div>

</div>
`;

  const errorBox = document.getElementById("auth-error");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  function showError(message) {
    errorBox.textContent = message || "Something went wrong";
    errorBox.classList.add("show");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.remove("show");
  }

  /* LOGIN */
  document.getElementById("login-btn").addEventListener("click", async () => {
    clearError();

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showError("Email and password required");
        return;
      }

      await loginUser(email, password);

      onSuccess();
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      showError(err?.message || "Login failed");
    }
  });

  /* SIGNUP */
  document.getElementById("signup-btn").addEventListener("click", async () => {
    clearError();

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      if (!email || !password) {
        showError("Email and password required");
        return;
      }

      await signupUser({
        name: email.split("@")[0],
        email,
        password,
        password_confirmation: password,
      });

      onSuccess();
    } catch (err) {
      console.error("SIGNUP ERROR:", err);
      showError(err?.message || "Signup failed");
    }
  });
}