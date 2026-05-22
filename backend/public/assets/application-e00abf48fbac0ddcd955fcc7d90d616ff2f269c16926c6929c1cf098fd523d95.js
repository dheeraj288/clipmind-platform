import "@hotwired/turbo-rails"
import "controllers"

function highlightCode() {
  if (!window.hljs) return

  document.querySelectorAll("pre code").forEach((block) => {
    block.removeAttribute("data-highlighted")
    window.hljs.highlightElement(block)
  })
}

document.addEventListener("turbo:load", highlightCode)
document.addEventListener("turbo:render", highlightCode)
document.addEventListener("turbo:frame-load", highlightCode);
