const API_BASE =
  "http://localhost:3000/api/v1";

/* LOGIN */
export async function loginUser(
  email,
  password
) {

  const response =
    await fetch(
      `${API_BASE}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.error ||
      "Login failed"
    );
  }

  await chrome.storage.local.set({

    token:
      data.token,

    currentUser:
      data.user,
  });

  return data;
}

/* SIGNUP */
export async function signupUser(
  payload
) {

  const response =
    await fetch(
      `${API_BASE}/signup`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          user: payload,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {

    throw new Error(
      data.errors?.join(", ")
      || "Signup failed"
    );
  }

  await chrome.storage.local.set({

    token:
      data.token,

    currentUser:
      data.user,
  });

  return data;
}

/* LOGOUT */
export async function logoutUser() {

  await chrome.storage.local.remove([
    "token",
    "currentUser",
  ]);
}

/* GET TOKEN */
export async function getToken() {

  const result =
    await chrome.storage.local.get(
      "token"
    );

  return result.token;
}

/* GET USER */
export async function getCurrentUser() {

  const result =
    await chrome.storage.local.get(
      "currentUser"
    );

  return result.currentUser;
}