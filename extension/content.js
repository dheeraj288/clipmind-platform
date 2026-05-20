console.log(
  "Clipboard Pro Content Script Loaded"
);

/* GLOBAL STATE */
let lastCopiedText = "";
let lastCopiedTime = 0;

/* CONFIG */
const COPY_COOLDOWN = 1200;

/* META HELPER */
function getMetaContent(selector) {
  return (
    document
      .querySelector(selector)
      ?.getAttribute("content") || null
  );
}

/* SOURCE CONTEXT */
function getSourceContext() {
  const selection =
    window.getSelection();

  const text =
    selection
      ?.toString()
      ?.trim();

  let surroundingText = "";

  try {
    const node =
      selection?.anchorNode;

    const parent =
      node?.parentElement;

    surroundingText =
      parent
        ?.innerText
        ?.slice(0, 500) || "";
  } catch (error) {
    surroundingText = "";
  }

  return {
    content: text,

    source_url:
      window.location.href,

    page_title:
      document.title,

    site_name:
      window.location.hostname,

    favicon_url:
      getFaviconUrl(),

    preview_image:
      getPreviewImage(),

    page_description:
      getMetaContent(
        'meta[name="description"]'
      ) ||
      getMetaContent(
        'meta[property="og:description"]'
      ),

    content_kind:
      detectContentKind(),

    surrounding_text:
      surroundingText,
  };
}

/* FAVICON */
function getFaviconUrl() {
  const icon =
    document.querySelector(
      'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
    );

  if (icon?.href) {
    return icon.href;
  }

  return `${location.origin}/favicon.ico`;
}

/* PREVIEW IMAGE */

function getPreviewImage() {
  const url =
    window.location.href;

  try {
    const parsedUrl =
      new URL(url);

    let videoId = null;

    if (
      parsedUrl.hostname.includes(
        "youtube.com"
      )
    ) {
      videoId =
        parsedUrl.searchParams.get("v");

      if (
        !videoId &&
        parsedUrl.pathname.startsWith(
          "/shorts/"
        )
      ) {
        videoId =
          parsedUrl.pathname
            .replace("/shorts/", "")
            .split("/")[0];
      }
    }

    if (
      parsedUrl.hostname.includes(
        "youtu.be"
      )
    ) {
      videoId =
        parsedUrl.pathname
          .replace("/", "")
          .split("?")[0];
    }

    console.log(
      "YOUTUBE VIDEO ID:",
      videoId
    );

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

  } catch (error) {
    console.error(
      "Preview image detect error:",
      error
    );
  }

  return (
    getMetaContent(
      'meta[property="og:image"]'
    ) ||
    getMetaContent(
      'meta[name="twitter:image"]'
    ) ||
    null
  );
}

/* CONTENT KIND */
function detectContentKind() {
  const url =
    window.location.href.toLowerCase();

  const type =
    getMetaContent(
      'meta[property="og:type"]'
    );

  if (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    type === "video"
  ) {
    return "video";
  }

  if (
    type === "article" ||
    document.querySelector("article")
  ) {
    return "article";
  }

  if (
    getPreviewImage()
  ) {
    return "rich";
  }

  return "page";
}

/* HANDLE COPY */
function handleCopy() {
  setTimeout(() => {
    const context =
      getSourceContext();

    const text =
      context.content;

    if (!text) return;

    const now =
      Date.now();

    if (
      text === lastCopiedText &&
      now - lastCopiedTime < COPY_COOLDOWN
    ) {
      return;
    }

    lastCopiedText = text;
    lastCopiedTime = now;

    console.log(
      "COPIED WITH CONTEXT:",
      context
    );

    chrome.runtime.sendMessage({
      type: "SAVE_CLIP",
      ...context,
    });
  }, 80);
}

/* COPY EVENT */
document.addEventListener(
  "copy",
  handleCopy
);

/* RESET */
document.addEventListener(
  "selectionchange",
  () => {
    const text =
      window
        .getSelection()
        ?.toString()
        ?.trim();

    if (!text) {
      lastCopiedText = "";
    }
  }
);