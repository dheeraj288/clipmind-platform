console.log(
  "Clipboard Pro Content Script Loaded"
);

/* GLOBAL STATE */
let lastCopiedText = "";
let lastCopiedTime = 0;

/* CONFIG */
const COPY_COOLDOWN = 1200;

/* HANDLE COPY */
function handleCopy() {

  setTimeout(() => {

    const selection =
      window.getSelection();

    const text =
      selection
        ?.toString()
        ?.trim();

    if (!text) return;

    const now =
      Date.now();

    /* PREVENT SPAM */
    if (

      text ===
        lastCopiedText &&

      now -
        lastCopiedTime <
        COPY_COOLDOWN
    ) {
      return;
    }

    lastCopiedText =
      text;

    lastCopiedTime =
      now;

    console.log(
      "COPIED:",
      text
    );

    chrome.runtime.sendMessage({

      type: "SAVE_CLIP",

      content: text,

      source_url:
        window.location.href,

      page_title:
        document.title,
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