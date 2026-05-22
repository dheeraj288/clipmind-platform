import "@hotwired/turbo-rails"
import "controllers"

function highlightCode() {
  if (!window.Prism) return

  document.querySelectorAll("pre code").forEach((block) => {
    window.Prism.highlightElement(block)
  })
}

document.addEventListener("turbo:load", highlightCode)
document.addEventListener("turbo:render", highlightCode)
document.addEventListener("turbo:frame-load", highlightCode);
