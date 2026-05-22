import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "input", "item"]

  connect() {
    this.index = 0
    this.close()

    this.keydownHandler = this.handleKeydown.bind(this)
    document.addEventListener("keydown", this.keydownHandler)
  }

  disconnect() {
    document.removeEventListener("keydown", this.keydownHandler)
  }

  handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault()
      this.open()
    }

    if (event.key === "Escape") {
      this.close()
    }

    if (!this.isOpen()) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      this.move(1)
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      this.move(-1)
    }

    if (event.key === "Enter") {
      event.preventDefault()
      this.itemTargets[this.index]?.click()
    }
  }

  open() {
    this.panelTarget.classList.remove("hidden")
    this.inputTarget.focus()
    this.index = 0
    this.highlight()
  }

  close() {
    this.panelTarget.classList.add("hidden")
  }

  isOpen() {
    return !this.panelTarget.classList.contains("hidden")
  }

  move(step) {
    this.index = (this.index + step + this.itemTargets.length) % this.itemTargets.length
    this.highlight()
  }

  highlight() {
    this.itemTargets.forEach((item, i) => {
      item.classList.toggle("bg-fuchsia-500/10", i === this.index)
      item.classList.toggle("border-fuchsia-500/30", i === this.index)
    })
  }

  search(event) {
    const query = event.target.value.toLowerCase()

    this.itemTargets.forEach((item) => {
      const text = item.innerText.toLowerCase()
      item.classList.toggle("hidden", !text.includes(query))
    })
  }
};
