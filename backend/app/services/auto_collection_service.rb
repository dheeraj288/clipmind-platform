class AutoCollectionService

  LANGUAGE_COLLECTIONS = {
    "ruby" => "Ruby On Rails",
    "javascript" => "Frontend",
    "typescript" => "Frontend",
    "jsx" => "Frontend",
    "html" => "Frontend",
    "css" => "Frontend",
    "python" => "Python",
    "php" => "PHP",
    "java" => "Java",
    "cpp" => "C / C++",
    "c" => "C / C++",
    "go" => "Go",
    "rust" => "Rust",
    "dart" => "Flutter / Dart",
    "sql" => "Database",
    "json" => "API Snippets",
    "yaml" => "DevOps Commands",
    "docker" => "DevOps Commands",
    "shell" => "DevOps Commands"
  }.freeze

  FALLBACK_RULES = {
    "Ruby On Rails" => [
      "rails",
      "activerecord",
      "migration",
      "controller",
      "model",
      "routes.rb",
      "has_many",
      "belongs_to"
    ],

    "Frontend" => [
      "html",
      "css",
      "javascript",
      "typescript",
      "react",
      "jsx",
      "tsx",
      "function ",
      "const ",
      "let ",
      "document.",
      "window.",
      "queryselector",
      "addeventlistener"
    ],

    "Python" => [
      "def ",
      "print(",
      "__init__",
      "import ",
      "lambda",
      "self"
    ],

    "Database" => [
      "sql",
      "postgres",
      "mysql",
      "schema",
      "create_table",
      "add_column",
      "select ",
      "insert into"
    ],

    "DevOps Commands" => [
      "docker",
      "kubectl",
      "sudo",
      "chmod",
      "touch",
      "mkdir",
      "npm ",
      "git "
    ],

    "API Snippets" => [
      "fetch(",
      "axios",
      "authorization",
      "bearer",
      "endpoint",
      "json"
    ]
  }.freeze

  def initialize(user:, clip:)
    @user = user
    @clip = clip
  end

  def call
    collection_name =
      detect_collection_name

    return unless collection_name

    collection =
      user
        .collections
        .find_or_create_by!(
          name: collection_name
        )

    clip.update(
      collection: collection
    )
  end

  private

  attr_reader :user, :clip

  def detect_collection_name
    by_language =
      LANGUAGE_COLLECTIONS[
        clip.language.to_s
      ]

    return by_language if by_language.present?

    detect_by_content
  end

  def detect_by_content
    text =
      clip.content
          .to_s
          .downcase

    scores =
      FALLBACK_RULES.transform_values do |keywords|
        keywords.count do |keyword|
          text.include?(
            keyword.downcase
          )
        end
      end

    name, score =
      scores.max_by do |_collection, value|
        value
      end

    return nil if score.to_i <= 0

    name
  end
end