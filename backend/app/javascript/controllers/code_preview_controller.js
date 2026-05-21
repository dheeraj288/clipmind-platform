import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content", "button"]

  connect() {
    this.expanded = false
  }

  toggle() {
    this.expanded = !this.expanded

    if (this.expanded) {
      this.contentTarget.classList.remove("max-h-52", "overflow-hidden")
      this.contentTarget.classList.add("max-h-[650px]", "overflow-auto")
      this.buttonTarget.textContent = "Hide"
    } else {
      this.contentTarget.classList.add("max-h-52", "overflow-hidden")
      this.contentTarget.classList.remove("max-h-[650px]", "overflow-auto")
      this.buttonTarget.textContent = "Show More"
    }
  }
}