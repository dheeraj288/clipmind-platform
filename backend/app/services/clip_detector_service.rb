class ClipDetectorService

  URL_REGEX =
    /\Ahttps?:\/\/\S+\z/

  EMAIL_REGEX =
    /\A[^@\s]+@[^@\s]+\z/

  LANGUAGE_RULES = {
    "html" => [
      "<!doctype html",
      "<html",
      "<head",
      "<body",
      "<div",
      "<span",
      "<section",
      "<form",
      "<input",
      "</html>"
    ],

    "jsx" => [
      "import react",
      "usestate",
      "useeffect",
      "classname=",
      "return (",
      "</>",
      ".jsx",
      ".tsx"
    ],

    "javascript" => [
      "function ",
      "const ",
      "let ",
      "var ",
      "console.log",
      "document.",
      "window.",
      "queryselector",
      "addeventlistener",
      "setinterval",
      "settimeout",
      "fetch(",
      "=>"
    ],

    "typescript" => [
      "interface ",
      "type ",
      ": string",
      ": number",
      ": boolean",
      "readonly ",
      "implements "
    ],

    "css" => [
      "color:",
      "background:",
      "display:",
      "grid-template",
      "border-radius",
      "font-size",
      "padding:",
      "margin:",
      "flex:",
      "position:"
    ],

    "ruby" => [
      "rails",
      "activerecord",
      "applicationrecord",
      "before_action",
      "has_many",
      "belongs_to",
      "validates",
      "create_table",
      "add_column",
      "def ",
      "end",
      "puts "
    ],

    "python" => [
      "def ",
      "print(",
      "import ",
      "from ",
      "__init__",
      "self",
      "lambda ",
      "elif ",
      "none"
    ],

    "sql" => [
      "select ",
      "insert into",
      "update ",
      "delete from",
      "create table",
      "alter table",
      "where ",
      "join ",
      "order by",
      "group by"
    ],

    "yaml" => [
      "version:",
      "services:",
      "jobs:",
      "name:",
      "on:",
      "---",
      "adapter:"
    ],

    "docker" => [
      "dockerfile",
      "docker-compose",
      "docker compose",
      "from ",
      "workdir",
      "copy ",
      "run ",
      "cmd ",
      "expose "
    ],

    "shell" => [
      "rails ",
      "bundle ",
      "npm ",
      "yarn ",
      "pnpm ",
      "git ",
      "docker ",
      "kubectl ",
      "sudo ",
      "chmod ",
      "mkdir ",
      "touch ",
      "cd ",
      "ls ",
      "grep ",
      "curl "
    ],

    "php" => [
      "<?php",
      "echo ",
      "$_post",
      "$_get",
      "public function",
      "namespace ",
      "->"
    ],

    "java" => [
      "public class",
      "public static void main",
      "system.out.println",
      "private ",
      "extends ",
      "implements "
    ],

    "cpp" => [
      "#include",
      "std::",
      "cout",
      "cin",
      "using namespace std",
      "int main()"
    ],

    "go" => [
      "package main",
      "func ",
      "fmt.println",
      "import ("
    ],

    "rust" => [
      "fn main",
      "let mut",
      "println!",
      "impl ",
      "use std::",
      "pub struct"
    ],

    "dart" => [
      "void main",
      "widget build",
      "statelesswidget",
      "statefulwidget",
      "materialapp",
      "scaffold("
    ]
  }.freeze

  def self.detect(content)
    content =
      content.to_s.strip

    return {
      clip_type: "link",
      language: nil
    } if content.match?(URL_REGEX)

    return {
      clip_type: "email",
      language: nil
    } if content.match?(EMAIL_REGEX)

    return {
      clip_type: "json",
      language: "json"
    } if json?(content)

    language =
      detect_language(content)

    return {
      clip_type: "command",
      language: "shell"
    } if language == "shell" && single_line?(content)

    return {
      clip_type: "code",
      language: language
    } if language.present?

    {
      clip_type: "text",
      language: nil
    }
  end

  def self.json?(content)
    JSON.parse(content)
    true
  rescue JSON::ParserError
    false
  end

  def self.detect_language(content)
    text =
      content.downcase

    scores =
      LANGUAGE_RULES.transform_values do |keywords|
        keywords.count do |keyword|
          text.include?(keyword.downcase)
        end
      end

    # Extra strong checks
    scores["html"] += 5 if text.match?(/<\/?[a-z][\s\S]*>/)
    scores["python"] += 5 if content.match?(/^\s*def\s+\w+\(.*\):/)
    scores["css"] += 4 if text.match?(/[.#]?[a-z0-9_-]+\s*\{[\s\S]*\}/)
    scores["ruby"] += 4 if text.include?("end") && text.include?("def ")
    scores["javascript"] += 4 if text.include?("{") && text.include?("function ")

    language, score =
      scores.max_by { |_lang, value| value }

    return nil if score.to_i <= 0

    language
  end

  def self.single_line?(content)
    !content.include?("\n")
  end
end