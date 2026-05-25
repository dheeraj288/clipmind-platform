import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "list", "dropzone"]

  connect() {
    this.files = []
  }

  openPicker() {
    this.inputTarget.click()
  }

  pick(event) {
    this.addFiles(event.target.files)
  }

  dragOver(event) {
    event.preventDefault()
    this.dropzoneTarget.classList.add("border-fuchsia-400", "bg-fuchsia-500/10")
  }

  dragLeave(event) {
    event.preventDefault()
    this.dropzoneTarget.classList.remove("border-fuchsia-400", "bg-fuchsia-500/10")
  }

  drop(event) {
    event.preventDefault()
    this.dropzoneTarget.classList.remove("border-fuchsia-400", "bg-fuchsia-500/10")

    this.addFiles(event.dataTransfer.files)
  }

  paste(event) {
    const files = Array.from(event.clipboardData.files || [])

    if (files.length === 0) return

    event.preventDefault()
    this.addFiles(files)
  }

  addFiles(fileList) {
    const incoming = Array.from(fileList)

    incoming.forEach((file) => {
      const alreadyExists = this.files.some((savedFile) => {
        return savedFile.name === file.name &&
          savedFile.size === file.size &&
          savedFile.lastModified === file.lastModified
      })

      if (!alreadyExists) {
        this.files.push(file)
      }
    })

    this.syncInput()
    this.render()
  }

  syncInput() {
    const dataTransfer = new DataTransfer()

    this.files.forEach((file) => {
      dataTransfer.items.add(file)
    })

    this.inputTarget.files = dataTransfer.files
  }

  render() {
    if (this.files.length === 0) {
      this.listTarget.innerHTML = ""
      return
    }

    this.listTarget.innerHTML = this.files.map((file, index) => {
      return `
        <div class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-bold text-white">${this.escape(file.name)}</p>
            <p class="text-xs text-slate-500">${this.formatSize(file.size)}</p>
          </div>

          <button
            type="button"
            data-index="${index}"
            data-action="click->file-drop#remove"
            class="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 hover:bg-red-500/20">
            Remove
          </button>
        </div>
      `
    }).join("")
  }

  remove(event) {
    const index = Number(event.currentTarget.dataset.index)

    this.files.splice(index, 1)
    this.syncInput()
    this.render()
  }

  formatSize(size) {
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  escape(value) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;")
  }
};
