// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"



import Prism from "prismjs"

import "prismjs/themes/prism-tomorrow.css"

import "prismjs/components/prism-ruby"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-json"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"

function highlightCode() {
  document.querySelectorAll("pre code").forEach((block) => {
    Prism.highlightElement(block)
  })
}

document.addEventListener("turbo:load", highlightCode)

document.addEventListener(
  "turbo:frame-load",
  highlightCode
)

document.addEventListener(
  "turbo:render",
  highlightCode
);
