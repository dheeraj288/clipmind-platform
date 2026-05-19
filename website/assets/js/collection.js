import {
  getToken,
  logout,
  toggleFavorite,
  deleteClip,
  incrementCopy,
  updateClip,
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

const API_BASE =
  "http://localhost:3000/api/v1";

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

function getCodeLanguage(clip) {
  const language =
    clip.language ||
    clip.clip_type ||
    "javascript";

  if (language === "ruby") return "ruby";
  if (language === "javascript") return "javascript";
  if (language === "js") return "javascript";
  if (language === "css") return "css";
  if (language === "html") return "markup";
  if (language === "erb") return "markup";
  if (language === "json") return "javascript";

  return "javascript";
}

function renderCodeBlock(clip) {
  return `
    <div class="web-code-wrapper">

      <pre
        class="web-code-block"
        id="code-${clip.id}"
      ><code class="language-${getCodeLanguage(clip)}">${escapeHtml(
        clip.content || ""
      )}</code></pre>

      <div class="code-controls">

        <button
          class="code-btn"
          data-toggle="${clip.id}"
        >
          Show More
        </button>

        <button
          class="code-btn"
          data-copy-code="${clip.id}"
        >
          Copy Code
        </button>

      </div>

    </div>
  `;
}

async function request(endpoint) {

  const response =
    await fetch(
      `${API_BASE}${endpoint}`,
      {
        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${getToken()}`,
        },
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
      data.message ||
      "API Error"
    );
  }

  return data;
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
            ? renderCodeBlock(clip)
            : `
              <div class="clip-content">
                ${escapeHtml(
                  clip.content || ""
                )}
              </div>
            `
        }

         ${
          clip.tags && clip.tags.length
            ? `
              <div class="tag-list">
                ${clip.tags.map((tag) => `
                  <span class="tag-pill">
                    #${escapeHtml(tag)}
                  </span>
                `).join("")}
              </div>
            `
            : ""
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

  if (window.Prism) {
    Prism.highlightAllUnder(list);
  }
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

    const toggleId =
      e.target.dataset.toggle;

    const copyCodeId =
      e.target.dataset.copyCode;

    if (toggleId) {

      const code =
        document.getElementById(
          `code-${toggleId}`
        );

      if (!code) return;

      code.classList.toggle(
        "expanded"
      );

      e.target.textContent =
        code.classList.contains(
          "expanded"
        )
          ? "Hide"
          : "Show More";

      return;
    }

    if (copyCodeId) {

      const clip =
        clips.find(
          (item) =>
            String(item.id) ===
            String(copyCodeId)
        );

      if (!clip) return;

      await navigator.clipboard.writeText(
        clip.content || ""
      );

      showToast(
        "Code copied ✔"
      );

      return;
    }

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