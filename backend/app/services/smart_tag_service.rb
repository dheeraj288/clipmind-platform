class SmartTagService

  LANGUAGE_TAGS = {
    "ruby" => ["ruby", "rails", "backend"],
    "javascript" => ["javascript", "frontend"],
    "typescript" => ["typescript", "frontend"],
    "jsx" => ["react", "jsx", "frontend"],
    "html" => ["html", "frontend"],
    "css" => ["css", "frontend"],
    "python" => ["python", "backend"],
    "php" => ["php", "backend"],
    "java" => ["java", "backend"],
    "sql" => ["sql", "database"],
    "json" => ["json", "api"],
    "yaml" => ["yaml", "devops"],
    "docker" => ["docker", "devops"],
    "shell" => ["terminal", "command", "devops"]
  }.freeze

  KEYWORD_TAGS = {
    "migration" => "migration",
    "create_table" => "database",
    "controller" => "controller",
    "model" => "model",
    "api" => "api",
    "jwt" => "auth",
    "token" => "auth",
    "fetch(" => "api",
    "docker" => "docker",
    "git " => "git"
  }.freeze

  def initialize(clip)
    @clip = clip
  end

  def call
    tags = []

    tags += LANGUAGE_TAGS.fetch(
      clip.language.to_s,
      []
    )

    text =
      clip.content
          .to_s
          .downcase

    KEYWORD_TAGS.each do |keyword, tag|
      tags << tag if text.include?(keyword)
    end

    tags.uniq.first(8)
  end

  private

  attr_reader :clip
end