import {
  signupUser,
  getToken,
} from "./api.js";

const form =
  document.getElementById(
    "signup-form"
  );

const nameInput =
  document.getElementById("name");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const passwordConfirmationInput =
  document.getElementById(
    "password-confirmation"
  );

const message =
  document.getElementById("message");

const submitBtn =
  form?.querySelector("button");

if (getToken()) {
  window.location.href =
    "dashboard.html";
}

function setMessage(
  text,
  type = "error"
) {
  message.textContent = text;
  message.className =
    `auth-message ${type}`;
}

function setLoading(loading) {
  submitBtn.disabled = loading;

  submitBtn.textContent =
    loading
      ? "Creating account..."
      : "Create account";
}

form?.addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    const name =
      nameInput.value.trim();

    const email =
      emailInput.value.trim();

    const password =
      passwordInput.value.trim();

    const passwordConfirmation =
      passwordConfirmationInput.value.trim();

    if (
      !name ||
      !email ||
      !password ||
      !passwordConfirmation
    ) {
      setMessage(
        "All fields are required"
      );
      return;
    }

    if (
      password !==
      passwordConfirmation
    ) {
      setMessage(
        "Passwords do not match"
      );
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await signupUser(
        name,
        email,
        password,
        passwordConfirmation
      );

      setMessage(
        "Account created ✅",
        "success"
      );

      window.location.href =
        "dashboard.html";

    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
        "Signup failed"
      );

    } finally {
      setLoading(false);
    }
  }
);

document
.querySelectorAll(
	".toggle-password"
	)

	.forEach(icon=>{

	icon.addEventListener(
	"click",
	()=>{

	const input=
	document.getElementById(
	icon.dataset.target
	);

	input.type=
	input.type==="password"
	? "text"
	: "password";

	}
  );

});