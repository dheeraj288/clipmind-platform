(() => {
  if (window.__CLIPMIND_CONTENT_SCRIPT_LOADED__) return

  window.__CLIPMIND_CONTENT_SCRIPT_LOADED__ = true

  console.log("ClipMind content script loaded")

  let lastCopiedText = ""
  let lastCopiedTime = 0

  const COPY_COOLDOWN = 1500

  function textMeta(name) {
    const tag =
      document.querySelector(`meta[name="${name}"]`) ||
      document.querySelector(`meta[property="${name}"]`)

    return tag?.content || null
  }

  function faviconUrl() {
    const icon =
      document.querySelector('link[rel="icon"]') ||
      document.querySelector('link[rel="shortcut icon"]') ||
      document.querySelector('link[rel="apple-touch-icon"]')

    if (!icon?.href) return `${location.origin}/favicon.ico`

    return icon.href
  }

  function getSiteName() {
    return (
      textMeta("og:site_name") ||
      location.hostname.replace("www.", "")
    )
  }

  function getPreviewImage() {
    return textMeta("og:image")
  }

  function getDescription() {
    return (
      textMeta("description") ||
      textMeta("og:description")
    )
  }

  function getSurroundingText() {
    const selection = window.getSelection()

    if (!selection || selection.rangeCount === 0) return null

    const node = selection.anchorNode
    const parent = node?.parentElement

    return parent?.innerText?.trim()?.slice(0, 500) || null
  }

  function sendClip(text) {
    const now = Date.now()

    if (text === lastCopiedText && now - lastCopiedTime < COPY_COOLDOWN) {
      return
    }

    lastCopiedText = text
    lastCopiedTime = now

    chrome.runtime.sendMessage({
      type: "SAVE_CLIP",
      content: text,
      source_url: window.location.href,
      page_title: document.title,
      site_name: getSiteName(),
      favicon_url: faviconUrl(),
      preview_image: getPreviewImage(),
      page_description: getDescription(),
      content_kind: "selection",
      surrounding_text: getSurroundingText()
    })
  }

  document.addEventListener("copy", () => {
    setTimeout(async () => {
      let copiedText = ""

      try {
        copiedText = window.getSelection().toString().trim()
      } catch (_) {
        copiedText = ""
      }

      if (!copiedText) return

      sendClip(copiedText)
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