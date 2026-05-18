import {
  fetchTrending,
  getToken,
  logout,
  toggleFavorite,
  incrementCopy,
} from "./api.js";

const list =
  document.getElementById(
    "trending-page-list"
  );

const logoutBtn =
  document.getElementById(
    "logout-btn"
  );

let trending = [];

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

function renderTrending(items = []) {

  if (!items.length) {

    list.innerHTML = `
      <div class="empty-state">
        No trending clips yet 🔥
      </div>
    `;

    return;
  }

  list.innerHTML =
    items.map((clip, index) => `

      <div
        class="web-clip-card premium-trend-card"
        data-id="${clip.id}"
      >

        <div class="clip-meta">

          <span class="type-badge">
            ${clip.clip_type || "text"}
          </span>

          <span>
            🔥 #${index + 1}
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
                ${escapeHtml(clip.content || "")}
              </div>
            `
        }

        <div class="trend-footer">

          <span class="copy-count-pill">
            📋 ${clip.copy_count || 0} copies
          </span>

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
              ${clip.is_favorite ? "⭐" : "☆"}
            </button>

          </div>

        </div>

      </div>

    `).join("");
}

async function loadTrending() {

  try {

    trending =
      await fetchTrending();

    renderTrending(
      trending
    );

  } catch (err) {

    console.error(err);

    list.innerHTML = `
      <div class="empty-state">
        Failed to load trending clips ❌
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

    if (copyId) {

      const clip =
        trending.find(
          (item) =>
            String(item.id) ===
            String(copyId)
        );

      if (!clip) return;

      await navigator.clipboard.writeText(
        clip.content || ""
      );

      await incrementCopy(
        copyId
      );

      await loadTrending();

      return;
    }

    if (favId) {

      await toggleFavorite(
        favId
      );

      await loadTrending();
    }
  }
);

loadTrending();