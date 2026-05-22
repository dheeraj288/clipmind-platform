import "@hotwired/turbo-rails"
import "controllers"

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function highlightClipCode() {
  document.querySelectorAll("[data-clip-code]").forEach((block) => {
    const rawCode = block.textContent.trim()

    let html = escapeHtml(rawCode)

    html = html
      .replace(/\b(class|module|def|end|do|if|else|elsif|return|true|false|nil|private|public|protected)\b/g, `<span class="clip-token-keyword">$1</span>`)
      .replace(/(:[a-zA-Z_]\w*)/g, `<span class="clip-token-symbol">$1</span>`)
      .replace(/\b([A-Z][A-Za-z0-9_:]*)\b/g, `<span class="clip-token-class">$1</span>`)
      .replace(/\b(\d+)\b/g, `<span class="clip-token-number">$1</span>`)

    block.innerHTML = html
  })
}

document.addEventListener("turbo:load", highlightClipCode)
document.addEventListener("turbo:render", highlightClipCode)
document.addEventListener("turbo:frame-load", highlightClipCode);
