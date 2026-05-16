import {
  fetchClips,
  deleteClipApi,
  toggleFavoriteApi,
  incrementCopyApi,
} from "../services/api.js";

import {
  getToken,
  logoutUser,
} from "../services/auth.js";

import {
  renderAuth,
} from "./authView.js";

/* ELEMENTS */
const app = document.getElementById("app");
const authContainer = document.getElementById("auth-container");

const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

/* STATE */
let data = [];
let currentFilter = "all";

/* HELPERS */
const escapeHtml = (text = "") =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const safeTime = (item) =>
  new Date(
    item.created_at || Date.now()
  ).toLocaleString();

const showToast = (
  message = "Copied ✔"
) => {

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1200);
};

const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

const getBadge = (type) => ({
  code: "💻 CODE",
  text: "📝 TEXT",
  link: "🌐 LINK",
  json: "📦 JSON",
  email: "📧 EMAIL",
  command: "⚡ COMMAND",
}[type] || "📋 CLIP");

const getSmartScore = (item) => {

  let score = 0;

  if (item.is_favorite) score += 1000;

  score += (item.copy_count || 0) * 50;

  const hoursAgo =
    (Date.now() -
      new Date(item.created_at)) /
    (1000 * 60 * 60);

  if (hoursAgo < 1) score += 500;
  else if (hoursAgo < 6) score += 300;
  else if (hoursAgo < 24) score += 100;
  else if (hoursAgo < 72) score += 50;

  if (item.clip_type === "code") score += 200;
  if (item.clip_type === "link") score += 150;

  return score;
};

const sortData = (items) =>
  [...items].sort(
    (a, b) =>
      getSmartScore(b) -
      getSmartScore(a)
  );

const filterData = (items) =>
  currentFilter === "all"
    ? items
    : items.filter(
        (i) =>
          i.clip_type ===
          currentFilter
      );

/* LOGOUT */
function setupLogout() {

  const logoutBtn =
    document.getElementById(
      "logout-btn"
    );

  if (!logoutBtn) return;

  logoutBtn.onclick = async () => {

    await logoutUser();

    location.reload();
  };
}

/* GROUPS */
function groupItems(items) {

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();

  const oneDay =
    1000 * 60 * 60 * 24;

  items.forEach((item) => {

    const created =
      new Date(item.created_at);

    const diff = now - created;

    if (
      created.toDateString() ===
      now.toDateString()
    ) {
      groups.today.push(item);

    } else if (
      diff < oneDay * 2
    ) {
      groups.yesterday.push(item);

    } else if (
      diff < oneDay * 7
    ) {
      groups.thisWeek.push(item);

    } else {
      groups.older.push(item);
    }
  });

  return groups;
}

/* CARD */
function createCard(item) {

  const card =
    document.createElement("div");

  card.className = "card";

  const type =
    item.clip_type || "text";

  const hostname = (() => {
    try {
      return item.source_url
        ? new URL(item.source_url)
            .hostname
        : "";
    } catch {
      return "";
    }
  })();

  const favicon = hostname
    ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
    : "";

  const pageTitle =
    item.page_title ||
    hostname ||
    "Unknown Source";

    let youtubeThumb = "";

      if (
        item.source_url &&
        item.source_url.includes("youtube.com")
      ) {

        try {

          const url =
            new URL(item.source_url);

          const videoId =
            url.searchParams.get("v");

          if (videoId) {

            youtubeThumb =
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }

        } catch {}
      }

  card.innerHTML = `
    <div class="badge">
      ${getBadge(type)}
    </div>

    <div class="actions">

      <button
        class="icon-btn delete"
        data-delete="${item.id}"
      >
        ×
      </button>

      <button
        class="icon-btn pin"
        data-fav="${item.id}"
      >
        ${
          item.is_favorite
            ? "⭐"
            : "☆"
        }
      </button>

    </div>

    <div class="meta">

      ${
        youtubeThumb
          ? `
          <img
            src="${youtubeThumb}"
            class="yt-thumb"
          />
        `
          : ""
      }

      <div class="meta-left">

        ${
          favicon
            ? `
            <img
              src="${favicon}"
              class="favicon"
            />
          `
            : ""
        }

        <div class="meta-info">

          <div class="meta-title">
            ${escapeHtml(pageTitle)}
          </div>

          <div class="meta-domain">
            ${hostname}
          </div>

        </div>

      </div>

    </div>

    <div class="content ${
      type === "code"
        ? "code"
        : ""
    }">

      ${
        type === "link"
          ? `
          <a
            href="${item.content}"
            target="_blank"
            class="clip-link"
          >
            ${item.content}
          </a>
        `
          : `
          ${
            type === "code"
              ? `
              <pre class="code-block">
<code>
${escapeHtml(item.content)}
</code>
              </pre>
            `
              : `
              <div class="text-content">
                ${escapeHtml(item.content)}
              </div>
            `
          }
        `
      }

    </div>

    <div class="time">

      <span>
        ${safeTime(item)}
      </span>

      <span class="copy-count">
        📋 ${item.copy_count || 0}
      </span>

    </div>
  `;

  /* COPY */
  card.onclick = async () => {

    try {

      await copyToClipboard(
        item.content
      );

      showToast();

      const res =
        await incrementCopyApi(
          item.id
        );

      item.copy_count =
        res.copy_count;

      render(data);

    } catch {
      showToast("Copy failed ❌");
    }
  };

  /* DELETE */
  card
    .querySelector("[data-delete]")
    .onclick = async (e) => {

      e.stopPropagation();

      await deleteClipApi(item.id);

      await load();
    };

  /* FAVORITE */
  card
    .querySelector("[data-fav]")
    .onclick = async (e) => {

      e.stopPropagation();

      await toggleFavoriteApi(
        item.id
      );

      await load();
    };

  return card;
}

/* RENDER */
function render(items = []) {

  list.innerHTML = "";

  const finalData =
    filterData(
      sortData(items)
    );

  if (!finalData.length) {

    list.innerHTML = `
      <div class="empty">
        No clips found 🚀
      </div>
    `;

    return;
  }

  const groups =
    groupItems(finalData);

  Object.entries(groups).forEach(
    ([title, items]) => {

      if (!items.length) return;

      const section =
        document.createElement(
          "div"
        );

      section.className =
        "timeline-section";

      section.innerHTML = `
        <div class="timeline-title">
          ${title.toUpperCase()}
        </div>
      `;

      items.forEach((item) => {
        section.appendChild(
          createCard(item)
        );
      });

      list.appendChild(section);
    }
  );
}

/* LOAD */
async function load() {

  try {

    const response =
      await fetchClips();

    data =
      Array.isArray(response)
        ? response
        : [];

    render(data);

  } catch (error) {

    console.error(error);

    list.innerHTML = `
      <div class="empty">
        Failed to load clips ❌
      </div>
    `;
  }
}

/* SEARCH */
search?.addEventListener(
  "input",

  (e) => {

    const value =
      e.target.value.toLowerCase();

    const filtered =
      data.filter((item) =>
        item.content
          ?.toLowerCase()
          .includes(value)
      );

    render(filtered);
  }
);

/* FILTER TABS */
document
  .querySelectorAll(".tab")
  .forEach((tab) => {

    tab.addEventListener(
      "click",

      () => {

        document
          .querySelectorAll(".tab")
          .forEach((b) =>
            b.classList.remove(
              "active"
            )
          );

        tab.classList.add(
          "active"
        );

        currentFilter =
          tab.dataset.type;

        render(data);
      }
    );
  });

/* INIT */
async function init() {

  const token =
    await getToken();

  if (!token) {

    app.classList.add("hidden");

    renderAuth(
      authContainer,

      async () => {

        authContainer.innerHTML = "";

        app.classList.remove("hidden");

        await load();

        setupLogout();
      }
    );

    return;
  }

  app.classList.remove("hidden");

  await load();

  setupLogout();
}

init();