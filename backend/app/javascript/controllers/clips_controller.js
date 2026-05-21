import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    content: String
  }

  copy() {
    navigator.clipboard.writeText(this.contentValue)

    this.element.innerText = "Copied"

    setTimeout(() => {
      this.element.innerText = "Copy"
    }, 1200)
  }
}