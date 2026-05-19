import {
  getToken,
  logout,
  toggleFavorite,
  deleteClip,
  incrementCopy,
  updateClip,
  request,
} from "./api.js";
import {
  showToast,
} from "./toast.js";

const title =
  document.getElementById(
    "collection-title"
  );

const list =
  document.getElementById(
    "collection-clips-list"
  );

const logoutBtn =
  document.getElementById(
    "logout-btn"
  );


const params =
  new URLSearchParams(
    window.location.search
  );

const collectionId =
  params.get("id");

let clips = [];

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



function renderClips(items = []) {

  if (!items.length) {

    list.innerHTML = `
      <div class="empty-state">
        No clips in this collection yet 📭
      </div>
    `;

    return;
  }

  list.innerHTML =
    items.map((clip) => `
      <div
        class="web-clip-card"
        data-id="${clip.id}"
      >

        <div class="clip-meta">

          <span class="type-badge">
            ${clip.clip_type || "text"}
          </span>

          <span>
            📋 ${clip.copy_count || 0}
          </span>

        </div>

        ${
          clip.clip_type === "code"
            ? `
              <pre class="web-code-block"><code>${escapeHtml(
                clip.content || ""
              )}</code></pre>
            `
            : `
              <div class="clip-content">
                ${escapeHtml(
                  clip.content || ""
                )}
              </div>
            `
        }

        <div class="web-card-actions">

          <button
            class="web-action-btn"
            data-copy="${clip.id}"
          >
            Copy
          </button>

          <button
            class="web-action-btn"
            data-fav="${clip.id}"
          >
            ${
              clip.is_favorite
                ? "⭐ Favorited"
                : "☆ Favorite"
            }
          </button>

          <button
            class="web-action-btn"
            data-remove="${clip.id}"
          >
            Remove from Collection
          </button>

          <button
            class="web-action-btn delete-btn"
            data-delete="${clip.id}"
          >
            Delete
          </button>

        </div>

      </div>
    `).join("");
}

async function loadCollection() {

  try {

    if (!collectionId) {

      title.textContent =
        "Collection not found";

      return;
    }

    const data =
      await request(
        `/collections/${collectionId}`
      );
      console.log("COLLECTION DATA:", data);

    title.innerHTML = `
      ${escapeHtml(data.collection.name)}
      <span>collection.</span>
    `;

    clips =
      data.clips || [];

    renderClips(clips);

  } catch (err) {

    console.error(err);

    list.innerHTML = `
      <div class="empty-state">
        Failed to load collection ❌
      </div>
    `;
  }
}

list?.addEventListener(
  "click",

  async (e) => {

    const copyId =
      e.target.dataset.copy;

    const favId =
      e.target.dataset.fav;

    const removeId =
      e.target.dataset.remove;

    const deleteId =
      e.target.dataset.delete;

    if (copyId) {

      const clip =
        clips.find(
          (item) =>
            String(item.id) ===
            String(copyId)
        );

      if (!clip) return;

      await navigator.clipboard.writeText(
        clip.content || ""
      );

      await incrementCopy(copyId);

      showToast("Copied ✔");

      await loadCollection();

      return;
    }

    if (favId) {

      await toggleFavorite(favId);

      showToast(
        "Favorite updated ⭐"
      );

      await loadCollection();

      return;
    }

    if (removeId) {

      await updateClip(
        removeId,
        {
          collection_id: null,
        }
      );

      showToast(
        "Removed from collection 📭"
      );

      await loadCollection();

      return;
    }

    if (deleteId) {

      await deleteClip(deleteId);

      showToast("Deleted 🗑");

      await loadCollection();
    }
  }
);

loadCollection();