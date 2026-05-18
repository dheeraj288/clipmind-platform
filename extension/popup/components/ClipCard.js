import {
  escapeHtml,
  safeTime,
  getBadge,
  copyToClipboard,
} from "../utils/helpers.js";

import {
  incrementCopyApi,
  deleteClipApi,
  toggleFavoriteApi,
} from "../../services/api.js";

export function createCard(
  item,
  {
    showToast,
    load,
    render,
    data,
  }
) {

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

  const isLong =
    item.content &&
    item.content.length > 220;

  card.innerHTML = `

    <div class="card-glow"></div>

    <div class="badge">
      ${getBadge(type)}
    </div>

    <div class="actions">

      <button
        class="icon-btn delete"
        data-delete="${item.id}"
      >
        ✕
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

            ${
              item.source_url
                ? `
                <a
                  href="${item.source_url}"
                  target="_blank"
                  class="title-link"
                >
                  ${escapeHtml(pageTitle)}
                </a>
              `
                : escapeHtml(pageTitle)
            }

          </div>

          ${
            hostname
              ? `
              <div class="meta-domain">
                ${hostname}
              </div>
            `
              : ""
          }

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
            🔗 ${item.content}
          </a>
        `

          : `

         ${
                type === "code"
                  ? `
                  <div class="code-wrapper">

                    <div class="code-header">

                      

                    </div>

                    <pre class="code-block ${
                      item.content.length > 300
                        ? "collapsed-code"
                        : ""
                    }">
                      <code>${escapeHtml(item.content)}</code>
                    </pre>

                    ${
                      item.content.length > 300
                        ? `
                        <button class="expand-btn code-expand-btn">
                          See More
                        </button>
                      `
                        : ""
                    }

                  </div>
                `

              : `
              <div class="text-content">

                <div class="clip-text ${
                  isLong ? "clamped" : ""
                }">
                  ${escapeHtml(item.content)}
                </div>

                ${
                  isLong
                    ? `
                    <button class="text-expand-btn">
                      See More
                    </button>
                  `
                    : ""
                }

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

  const textExpandBtn =
    card.querySelector(
      ".text-expand-btn"
    );

  const clipText =
    card.querySelector(
      ".clip-text"
    );

  textExpandBtn?.addEventListener(
    "click",
    (e) => {

      e.stopPropagation();

      const expanded =
        clipText.classList.contains(
          "expanded"
        );

      if (expanded) {

        clipText.classList.remove(
          "expanded"
        );

        clipText.classList.add(
          "clamped"
        );

        textExpandBtn.textContent =
          "See More";

      } else {

        clipText.classList.remove(
          "clamped"
        );

        clipText.classList.add(
          "expanded"
        );

        textExpandBtn.textContent =
          "See Less";
      }
    }
  );

  const codeExpandBtn =
    card.querySelector(
      ".code-expand-btn"
    );

  const codeBlock =
    card.querySelector(
      ".code-block"
    );

  codeExpandBtn?.addEventListener(
    "click",
    (e) => {

      e.stopPropagation();

      const expanded =
        codeBlock.classList.contains(
          "expanded-code"
        );

      if (expanded) {

        codeBlock.classList.remove(
          "expanded-code"
        );

        codeBlock.classList.add(
          "collapsed-code"
        );

        codeExpandBtn.textContent =
          "See More";

      } else {

        codeBlock.classList.remove(
          "collapsed-code"
        );

        codeBlock.classList.add(
          "expanded-code"
        );

        codeExpandBtn.textContent =
          "See Less";
      }
    }
  );

  card.onclick = async () => {

    try {

      await copyToClipboard(
        item.content
      );

      card.classList.add(
        "copied"
      );

      setTimeout(() => {

        card.classList.remove(
          "copied"
        );

      }, 300);

      showToast();

      const res =
        await incrementCopyApi(
          item.id
        );

      item.copy_count =
        res.copy_count;

      item.last_copied_at =
        new Date().toISOString();

      render(data);

    } catch {

      showToast(
        "Copy failed ❌"
      );
    }
  };

  card
    .querySelector("[data-delete]")
    .onclick = async (e) => {

      e.stopPropagation();

      await deleteClipApi(
        item.id
      );

      await load();
    };

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