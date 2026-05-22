// import { Controller } from "@hotwired/stimulus"

// export default class extends Controller {
//   static targets = ["code"]

//   connect() {
//     this.highlight()
//   }

//   highlight() {
//     if (!this.hasCodeTarget) return

//     const language = this.element.dataset.codeHighlightLanguageValue || "ruby"
//     const rawCode = this.codeTarget.textContent.trim()

//     this.codeTarget.innerHTML = this.highlightCode(rawCode, language.toLowerCase())
//     this.codeTarget.classList.add("clip-code")
//   }

//   highlightCode(code, language) {
//     const keywords = this.keywordsFor(language)

//     const pattern = new RegExp(
//       [
//         "(#.*$|//.*$)",
//         "([\"'`][\\s\\S]*?[\"'`])",
//         `\\b(${keywords.join("|")})\\b`,
//         "(:[a-zA-Z_]\\w*)",
//         "\\b([A-Z][A-Za-z0-9_:]*)\\b",
//         "\\b(\\d+(?:\\.\\d+)?)\\b",
//         "([{}\\[\\]().,|<>+=\\-*/])"
//       ].join("|"),
//       "gm"
//     )

//     return code.replace(pattern, (match, comment, string, keyword, symbol, constant, number, operator) => {
//       const value = this.escapeHtml(match)

//       if (comment) return `<span class="clip-token-comment">${value}</span>`
//       if (string) return `<span class="clip-token-string">${value}</span>`
//       if (keyword) return `<span class="clip-token-keyword">${value}</span>`
//       if (symbol) return `<span class="clip-token-symbol">${value}</span>`
//       if (constant) return `<span class="clip-token-class">${value}</span>`
//       if (number) return `<span class="clip-token-number">${value}</span>`
//       if (operator) return `<span class="clip-token-operator">${value}</span>`

//       return value
//     })
//   }

//   keywordsFor(language) {
//     const common = [
//       "class", "module", "def", "end", "do", "if", "else", "elsif", "unless",
//       "while", "until", "for", "in", "return", "yield", "super", "self",
//       "true", "false", "nil", "private", "public", "protected"
//     ]

//     const javascript = [
//       "function", "const", "let", "var", "class", "return", "if", "else",
//       "for", "while", "async", "await", "import", "export", "from", "new",
//       "true", "false", "null", "undefined"
//     ]

//     const python = [
//       "def", "class", "return", "if", "elif", "else", "for", "while",
//       "import", "from", "as", "try", "except", "with", "True", "False", "None"
//     ]

//     if (language === "javascript" || language === "js") return javascript
//     if (language === "python" || language === "py") return python

//     return common
//   }

//   escapeHtml(value) {
//     return value
//       .replaceAll("&", "&amp;")
//       .replaceAll("<", "&lt;")
//       .replaceAll(">", "&gt;")
//   }
// }