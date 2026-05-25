import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    text: String
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.textValue)

      const originalText = this.element.innerText
      this.element.innerText = "✅ Copied"

      setTimeout(() => {
        this.element.innerText = originalText
      }, 1200)
    } catch (error) {
      console.error("Copy summary failed:", error)
      this.element.innerText = "Copy failed"
    }
  }
}