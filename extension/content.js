(() => {
  if (window.__CLIPMIND_CONTENT_SCRIPT_LOADED__) {
    console.log("ClipMind content script already loaded")
    return
  }

  window.__CLIPMIND_CONTENT_SCRIPT_LOADED__ = true

  console.log("Clipboard Pro Content Script Loaded")

  let lastCopiedText = ""
  let lastCopiedTime = 0

  const COPY_COOLDOWN = 1200

  document.addEventListener("copy", () => {
    setTimeout(() => {
      const selectedText = window.getSelection().toString().trim()

      if (!selectedText) return

      const now = Date.now()

      if (selectedText === lastCopiedText && now - lastCopiedTime < COPY_COOLDOWN) {
        return
      }

      lastCopiedText = selectedText
      lastCopiedTime = now

      chrome.runtime.sendMessage({
        type: "SAVE_CLIP",
        content: selectedText,
        source_url: window.location.href,
        page_title: document.title
      })
    }, 80)
  })

  document.addEventListener("selectionchange", () => {
    const selectedText = window.getSelection().toString().trim()

    if (selectedText !== lastCopiedText) {
      lastCopiedText = ""
      lastCopiedTime = 0
    }
  })
})()