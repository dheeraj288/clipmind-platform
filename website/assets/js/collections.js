import {
  getToken,
  logout,
  fetchCollections,
  createCollection,
  deleteCollection,
  toggleCollectionPin,
} from "./api.js";

import {
  showToast,
} from "./toast.js";

const list =
  document.getElementById(
    "collections-list"
  );

const input =
  document.getElementById(
    "collection-name"
  );

const createBtn =
  document.getElementById(
    "create-collection-btn"
  );

const logoutBtn =
  document.getElementById(
    "logout-btn"
  );

let collections = [];

if (!getToken()) {
  window.location.href =
    "login.html";
}

logoutBtn?.addEventListener(
  "click",
  () => logout()
);

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderCollections(items = []) {
  if (!list) return;

  if (!items.length) {
    list.innerHTML = `
      <div class="empty-state">
        No collections yet 📚
      </div>
    `;

    return;
  }

  list.innerHTML = items
    .map((collection) => {

      const pinnedClass =
        collection.is_pinned
          ? "pinned-card"
          : "";

      const pinClass =
        collection.is_pinned
          ? "active-pin"
          : "";

      return `
        <a
          href="collection.html?id=${collection.id}"
          class="collection-card ${pinnedClass}"
        >

          <div class="collection-top">

            <div class="collection-icon">
              📚
            </div>

            <button
              <button
                <button
                  <button
                    type="button"
                    class="pin-icon-btn ${pinClass}"
                    data-pin="${collection.id}"
                    title="${
                      collection.is_pinned
                        ? "Unpin collection"
                        : "Pin collection"
                    }"
                  >
                    📌
                  </button>

          </div>

          <div class="collection-info">

            <h3>
              ${escapeHtml(collection.name)}
            </h3>

            <p>
              ${collection.clips_count || 0} clips ·
              ${collection.total_copies || 0} copies
            </p>

          </div>

          <div class="collection-actions">

            <button
              type="button"
              class="web-action-btn delete-btn"
              data-delete="${collection.id}"
            >
              Delete
            </button>

          </div>

        </a>
      `;
    })
    .join("");
}

async function loadCollections() {
  try {
    collections =
      await fetchCollections();

    renderCollections(
      collections
    );

  } catch (err) {
    console.error(err);

    if (list) {
      list.innerHTML = `
        <div class="empty-state">
          Failed to load collections ❌
        </div>
      `;
    }
  }
}

createBtn?.addEventListener(
  "click",
  async () => {

    const name =
      input.value.trim();

    if (!name) {
      showToast(
        "Enter collection name"
      );

      return;
    }

    await createCollection(
      name
    );

    input.value = "";

    await loadCollections();

    showToast(
      "Collection created 📚"
    );
  }
);

input?.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Enter") return;

    createBtn.click();
  }
);

list?.addEventListener(
  "click",
  async (e) => {

    const pinBtn =
      e.target.closest(
        "[data-pin]"
      );

    const deleteBtn =
      e.target.closest(
        "[data-delete]"
      );

    if (pinBtn) {
      e.preventDefault();
      e.stopPropagation();

      const pinId =
        pinBtn.dataset.pin;

      await toggleCollectionPin(
        pinId
      );

      await loadCollections();

      showToast(
        "Pin updated 📌"
      );

      return;
    }

    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();

      const deleteId =
        deleteBtn.dataset.delete;

      await deleteCollection(
        deleteId
      );

      await loadCollections();

      showToast(
        "Collection deleted 🗑"
      );
    }
  }
);

loadCollections();