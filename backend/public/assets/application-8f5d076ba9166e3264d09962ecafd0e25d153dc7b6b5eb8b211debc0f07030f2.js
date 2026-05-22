import "@hotwired/turbo-rails"
import "controllers"

function highlightPrism() {
  if (window.Prism) {
    document.querySelectorAll("pre code").forEach((block)=>{
      Prism.highlightElement(block)
    })
  }
}

document.addEventListener(
  "turbo:load",
  highlightPrism
)

document.addEventListener(
  "turbo:render",
  highlightPrism
)

document.addEventListener(
  "turbo:frame-load",
  highlightPrism
);
