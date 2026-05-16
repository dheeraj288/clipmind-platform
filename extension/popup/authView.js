import {
  loginUser,
  signupUser,
} from "../services/auth.js";

export function renderAuth(
  container,
  onSuccess
) {

  container.innerHTML = `

    <div class="auth-screen">

      <div class="auth-card">

        <div class="auth-logo">
          📋
        </div>

        <h1>
          Clipboard Pro
        </h1>

        <p class="auth-subtitle">
          Smart cloud clipboard manager
        </p>

        <div class="auth-form">

          <input
            type="email"
            id="email"
            placeholder="Enter email"
          />

          <input
            type="password"
            id="password"
            placeholder="Enter password"
          />

          <button id="login-btn">
            Login
          </button>

          <button id="signup-btn" class="secondary-btn">
            Create Account
          </button>

          <div id="auth-error"></div>

        </div>

      </div>

    </div>
  `;

  const loginBtn =
    document.getElementById(
      "login-btn"
    );

  const signupBtn =
    document.getElementById(
      "signup-btn"
    );

  loginBtn.addEventListener(
    "click",

    async () => {

      try {

        const email =
          document.getElementById(
            "email"
          ).value;

        const password =
          document.getElementById(
            "password"
          ).value;

        await loginUser(
          email,
          password
        );

        onSuccess();

      } catch (err) {

        console.error(err);

        document.getElementById(
          "auth-error"
        ).textContent =
          err.message;
      }
    }
  );

  signupBtn.addEventListener(
    "click",

    async () => {

      try {

        const email =
          document.getElementById(
            "email"
          ).value;

        const password =
          document.getElementById(
            "password"
          ).value;

        await signupUser({

          name:
            email.split("@")[0],

          email,

          password,

          password_confirmation:
            password,
        });

        onSuccess();

      } catch (err) {

        console.error(err);

        document.getElementById(
          "auth-error"
        ).textContent =
          err.message;
      }
    }
  );
}