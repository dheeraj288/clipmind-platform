class ClipDetectorService

  URL_REGEX = /\Ahttps?:\/\/\S+\z/
  EMAIL_REGEX = /\A[^@\s]+@[^@\s]+\z/

  def self.detect(content)
    content = content.to_s.strip

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

    return {
      clip_type: "code",
      language: detect_language(content)
    } if code?(content)

    {
      clip_type: "text",
      language: nil
    }
  end

  # JSON DETECTION
  def self.json?(content)
    JSON.parse(content)
    true
  rescue
    false
  end

  # CODE DETECTION
  def self.code?(content)

    keywords = [
      "def ",
      "class ",
      "module ",
      "function ",
      "const ",
      "let ",
      "var ",
      "puts ",
      "console.log",
      "end",
      "=>",
      "has_many",
      "belongs_to",
      "validates",
      "ApplicationRecord"
    ]

    keywords.any? { |k| content.include?(k) }
  end

  # LANGUAGE DETECTION
  def self.detect_language(content)

    ruby_keywords = [
      "def ",
      "class ",
      "module ",
      "puts ",
      "end",
      "ApplicationRecord",
      "has_many",
      "belongs_to",
      "validates"
    ]

    js_keywords = [
      "function ",
      "const ",
      "let ",
      "var ",
      "console.log",
      "=>"
    ]

    return "ruby" if ruby_keywords.any? { |k| content.include?(k) }

    return "javascript" if js_keywords.any? { |k| content.include?(k) }

    "plaintext"
  end
end