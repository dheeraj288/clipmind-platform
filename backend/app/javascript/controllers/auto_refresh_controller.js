import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    interval: { type: Number, default: 3000 }
  }

  connect() {
    this.timer = setInterval(() => {
      this.reloadFrame()
    }, this.intervalValue)
  }

  disconnect() {
    clearInterval(this.timer)
  }

  reloadFrame() {
    if (document.hidden) return

    this.element.reload()
  }
}