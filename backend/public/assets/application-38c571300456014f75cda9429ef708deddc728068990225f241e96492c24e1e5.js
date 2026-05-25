import "@hotwired/turbo-rails"
import "controllers"

function clipMindPrismHighlight() {
  if (window.Prism) {
    window.Prism.highlightAll()
  }
}

document.addEventListener("turbo:load", clipMindPrismHighlight)
document.addEventListener("turbo:render", clipMindPrismHighlight)
document.addEventListener("turbo:frame-load", clipMindPrismHighlight)

document.addEventListener("toggle", (event) => {
  if (event.target.open && window.Prism) {
    window.Prism.highlightAllUnder(event.target)
  }
}, true);
