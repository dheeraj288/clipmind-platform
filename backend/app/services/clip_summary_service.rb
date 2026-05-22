class ClipSummaryService
  def initialize(clip)
    @clip = clip
    @content = clip.content.to_s.strip
  end

  def call
    return "No content available to summarize." if @content.blank?

    if code_clip?
      summarize_code
    elsif link_clip?
      summarize_link
    else
      summarize_text
    end
  end

  private

  def code_clip?
    %w[code json command].include?(@clip.clip_type.to_s)
  end

  def link_clip?
    @clip.clip_type.to_s == "link" || @content.match?(/\Ahttps?:\/\//)
  end

  def summarize_code
    lines = @content.lines.map(&:strip).reject(&:blank?)

    important_lines =
      lines.select do |line|
        line.match?(/\A(class|module|def|function|const|let|var|import|export|if|else|case|render|redirect_to|before_action)/)
      end.first(8)

    important_lines = lines.first(8) if important_lines.empty?

    <<~TEXT.strip
      Code Summary:
      This clip looks like #{@clip.language.presence || @clip.clip_type} code.

      Key parts:
      #{important_lines.map { |line| "• #{line.truncate(120)}" }.join("\n")}
    TEXT
  end

  def summarize_link
    <<~TEXT.strip
      Link Summary:
      This clip contains a link or source reference.

      Title:
      #{@clip.page_title.presence || @clip.title.presence || "No title found"}

      Source:
      #{@clip.source_url.presence || @content}
    TEXT
  end

  def summarize_text
    sentences =
      @content
        .split(/(?<=[.!?])\s+/)
        .map(&:strip)
        .reject(&:blank?)

    selected =
      if sentences.size >= 2
        sentences.first(3)
      else
        @content.scan(/.{1,160}(?:\s|\z)/).map(&:strip).first(3)
      end

    <<~TEXT.strip
      Text Summary:
      #{selected.map { |sentence| "• #{sentence.truncate(180)}" }.join("\n")}
    TEXT
  end
end