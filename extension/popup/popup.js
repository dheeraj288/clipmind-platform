import {
  fetchClips,
  deleteClipApi,
  toggleFavoriteApi,
  incrementCopyApi,
} from "../services/api.js";

/* ELEMENTS */
const list = document.getElementById("list");
const search = document.getElementById("search");
const toast = document.getElementById("toast");

/* STATE */
let data = [];
let currentFilter = "all";

/* ESCAPE HTML */
function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* TOAST */
function showToast(message = "Copied ✔") {
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1200);
}


function sortData(items) {
  return [...items].sort((a, b) => {
    return getSmartScore(b) - getSmartScore(a);
  });
}

/* SAFE TIME */
function safeTime(item) {
  return new Date(item.created_at || Date.now()).toLocaleString();
}

/* FILTER */
function filterData(items) {
  if (currentFilter === "all") return items;

  return items.filter((item) => {
    return item.clip_type === currentFilter;
  });
}

/* SORT */
function getSmartScore(item) {
  let score = 0;

  /* ⭐ FAVORITE BOOST */
  if (item.is_favorite) {
    score += 1000;
  }

  /* 📋 COPY COUNT BOOST */
  score += (item.copy_count || 0) * 50;

  /* ⏱️ RECENCY BOOST */
  const createdAt = new Date(item.created_at).getTime();
  const hoursAgo =
    (Date.now() - createdAt) / (1000 * 60 * 60);

  if (hoursAgo < 1) score += 500;
  else if (hoursAgo < 6) score += 300;
  else if (hoursAgo < 24) score += 100;
  else if (hoursAgo < 72) score += 50;

  /* 🧠 TYPE PRIORITY BOOST */
  if (item.clip_type === "code") score += 200;
  if (item.clip_type === "link") score += 150;

  return score;
}

/* BADGE */
function getBadge(type) {
  const badgeMap = {
    code: "💻 CODE",
    text: "📝 TEXT",
    link: "🌐 LINK",
    json: "📦 JSON",
    email: "📧 EMAIL",
    command: "⚡ COMMAND",
  };

  return badgeMap[type] || "📋 CLIP";
}

/* COPY */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/* RENDER */
function render(items = []) {
  list.innerHTML = "";

  const finalData = filterData(sortData(items));

  if (!finalData.length) {
    list.innerHTML = `
      <div class="empty">
        No clips found 🚀
      </div>
    `;
    return;
  }

  /* GROUPS */
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  finalData.forEach((item) => {
    const created = new Date(item.created_at);
    const diff = now - created;

    if (created.toDateString() === now.toDateString()) {
      groups.today.push(item);
    } else if (diff < oneDay * 2) {
      groups.yesterday.push(item);
    } else if (diff < oneDay * 7) {
      groups.thisWeek.push(item);
    } else {
      groups.older.push(item);
    }
  });

  /* SECTION RENDER */
  function renderSection(title, items) {
    if (!items.length) return;

    const section = document.createElement("div");
    section.className = "timeline-section";

    section.innerHTML = `
      <div class="timeline-title">
        ${title}
      </div>
    `;

    items.forEach((item) => {
      const type = item.clip_type || "text";
      const language = item.language || "plaintext";

      const card = document.createElement("div");
      card.className = "card";

      /* BADGE */
      const badge = document.createElement("div");
      badge.className = "badge";
      badge.textContent = getBadge(type);

      /* ACTIONS */
      const actions = document.createElement("div");
      actions.className = "actions";

      const del = document.createElement("button");
      del.className = "icon-btn delete";
      del.innerHTML = "×";

      del.onclick = async (e) => {
        e.stopPropagation();
        await handleDelete(item.id);
      };

      const pin = document.createElement("button");
      pin.className = "icon-btn pin";
      pin.innerHTML = item.is_favorite ? "⭐" : "☆";

      pin.onclick = async (e) => {
        e.stopPropagation();
        await handleFavorite(item.id);
      };

      actions.append(del, pin);

      /* META */
      const meta = document.createElement("div");
      meta.className = "meta";

      let hostname = "";

      try {
        if (item.source_url) {
          hostname = new URL(item.source_url).hostname;
        }
      } catch (e) {}

      const favicon = item.source_url
        ? `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
        : "";

      const pageTitle =
        item.page_title || hostname || "Unknown Source";

      let youtubeThumb = "";

      if (
        item.source_url &&
        item.source_url.includes("youtube.com")
      ) {
        try {
          const url = new URL(item.source_url);
          const videoId = url.searchParams.get("v");

          if (videoId) {
            youtubeThumb =
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        } catch (e) {}
      }

      meta.innerHTML = `
        ${
          youtubeThumb
            ? `<img src="${youtubeThumb}" class="yt-thumb" />`
            : ""
        }

        <div class="meta-left">
          ${
            favicon
              ? `<img src="${favicon}" class="favicon" />`
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
      `;

      /* CONTENT */
      const content = document.createElement("div");

      if (type === "code") {
        content.className = "content code";

        content.innerHTML = `
          <div class="code-header">
            <span>${language.toUpperCase()}</span>
          </div>

          <pre class="code-block">
            <code class="language-${language}">
${escapeHtml(item.content)}
            </code>
          </pre>
        `;

        setTimeout(() => {
          if (window.Prism) Prism.highlightAll();
        }, 0);
      } else if (type === "link") {
        content.className = "content";

        content.innerHTML = `
          <a href="${item.content}" target="_blank" class="clip-link">
            ${item.content}
          </a>
        `;
      } else {
        content.className = "content";

        const isLong = item.content.length > 220;
        const shortText = item.content.slice(0, 220);

        content.innerHTML = `
          <div class="text-content">
            ${
              isLong
                ? `
              <span class="preview-text">
                ${escapeHtml(shortText)}...
              </span>

              <span class="full-text hidden">
                ${escapeHtml(item.content)}
              </span>

              <button class="expand-btn">
                Show More
              </button>
            `
                : `<span>${escapeHtml(item.content)}</span>`
            }
          </div>
        `;

        if (isLong) {
          const btn = content.querySelector(".expand-btn");
          const preview = content.querySelector(".preview-text");
          const full = content.querySelector(".full-text");

          btn.addEventListener("click", (e) => {
            e.stopPropagation();

            const expanded =
              !full.classList.contains("hidden");

            if (expanded) {
              full.classList.add("hidden");
              preview.classList.remove("hidden");
              btn.textContent = "Show More";
            } else {
              full.classList.remove("hidden");
              preview.classList.add("hidden");
              btn.textContent = "Show Less";
            }
          });
        }
      }

      /* SOURCE LINK */
      let sourcePreview = "";

      if (item.source_url) {
        const domain = (() => {
          try {
            return new URL(item.source_url).hostname.replace("www.", "");
          } catch {
            return "";
          }
        })();

        sourcePreview = `
          <a class="source-link" href="${item.source_url}" target="_blank">
            🌐 ${domain}
          </a>
        `;
      }

      /* TIME + COPY COUNT */
      const time = document.createElement("div");
      time.className = "time";

      time.innerHTML = `
        <span>${safeTime(item)}</span>
        <span class="copy-count">📋 ${item.copy_count || 0}</span>
      `;

      card.onclick = async () => {
        try {
          await copyToClipboard(item.content);

          card.classList.add("copied");
          setTimeout(() => card.classList.remove("copied"), 300);

          showToast("Copied ✔");

          const res = await incrementCopyApi(item.id);

          // ONLY trust backend
          item.copy_count = res.copy_count;

          render(data);

        } catch (err) {
          console.error(err);
          showToast("Copy failed ❌");
        }
      };
      /* APPEND */
      card.innerHTML += sourcePreview;

      card.append(badge, actions, meta, content, time);
      section.appendChild(card);
    });

    list.appendChild(section);
  }

  renderSection("TODAY", groups.today);
  renderSection("YESTERDAY", groups.yesterday);
  renderSection("THIS WEEK", groups.thisWeek);
  renderSection("OLDER", groups.older);
}

/* LOAD */
async function load() {
  try {
    const response = await fetchClips();
    data = Array.isArray(response) ? response : [];
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

/* DELETE */
async function handleDelete(id) {
  await deleteClipApi(id);
  await load();
}

/* FAVORITE */
async function handleFavorite(id) {
  await toggleFavoriteApi(id);
  await load();
}

/* SEARCH */
let t = null;

search?.addEventListener("input", (e) => {
  clearTimeout(t);

  t = setTimeout(() => {
    const value = e.target.value.toLowerCase();

    const filtered = data.filter((item) =>
      item.content?.toLowerCase().includes(value)
    );

    render(filtered);
  }, 150);
});

/* TABS */
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((b) => {
      b.classList.remove("active");
    });

    tab.classList.add("active");

    currentFilter = tab.dataset.type;

    render(data);
  });
});

/* INIT */
load();