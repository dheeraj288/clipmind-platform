// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"


function highlightPrism() {
  if (window.Prism) {
    window.Prism.highlightAll()
  }
}

document.addEventListener("turbo:load", highlightPrism)
document.addEventListener("turbo:render", highlightPrism)
document.addEventListener("turbo:frame-load", highlightPrism);
