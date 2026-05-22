import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["panel", "input", "item"]

  connect() {
    this.index = 0

    this.keydownHandler = this.handleKeydown.bind(this)
    document.addEventListener("keydown", this.keydownHandler)

    this.panelTarget.addEventListener(
      "click",
      this.backdropClick.bind(this)
    )

    this.close()
  }

  disconnect() {
    document.removeEventListener("keydown", this.keydownHandler)
  }

  handleKeydown(event) {
    if ((event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k") {

      event.preventDefault()

      if (this.isOpen()) {
        this.close()
      } else {
        this.open()
      }
    }

    if (!this.isOpen()) return

    if (event.key === "Escape") {
      this.close()
    }

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
    document.body.classList.add("overflow-hidden")

    this.panelTarget.classList.remove("hidden")

    setTimeout(() => {
      this.inputTarget.focus()
    },100)

    this.index = 0
    this.highlight()
  }

  close() {
    document.body.classList.remove("overflow-hidden")

    this.panelTarget.classList.add("hidden")

    this.inputTarget.value=""

    this.itemTargets.forEach(item=>{
      item.classList.remove("hidden")
    })
  }

  isOpen() {
    return !this.panelTarget.classList.contains("hidden")
  }

  move(step) {
    this.index =
      (this.index + step + this.itemTargets.length) %
      this.itemTargets.length

    this.highlight()
  }

  highlight() {
    this.itemTargets.forEach((item, i) => {

      item.classList.toggle(
        "bg-fuchsia-500/10",
        i===this.index
      )

      item.classList.toggle(
        "border-fuchsia-500/30",
        i===this.index
      )

    })
  }

  search(event) {
    let query=event.target.value.toLowerCase()

    this.itemTargets.forEach(item=>{

      let text=item.innerText.toLowerCase()

      item.classList.toggle(
        "hidden",
        !text.includes(query)
      )

    })
  }

  backdropClick(event){
    if(event.target===this.panelTarget){
      this.close()
    }
  }
}