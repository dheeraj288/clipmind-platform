import {
  getCurrentUser,
} from "./api.js";

const sidebar =
  document.querySelector(
    ".sidebar"
  );

const user =
  getCurrentUser();

if (sidebar && user) {
  const profile =
    document.createElement("div");

  profile.className =
    "sidebar-profile";

  profile.innerHTML = `
    <div class="profile-avatar">
      ${
        user.name
          ? user.name.charAt(0).toUpperCase()
          : "U"
      }
    </div>

    <div class="profile-info">
      <strong>
        ${user.name || "User"}
      </strong>

      <span>
        ${user.email || ""}
      </span>
    </div>
  `;

  sidebar.insertBefore(
    profile,
    sidebar.querySelector(".logout-btn")
  );
}