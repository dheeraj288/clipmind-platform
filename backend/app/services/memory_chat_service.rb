class MemoryChatService
  IGNORE_PATTERNS = [
    "form_with",
    "ai_chat_path",
    "index.html.erb"
  ].freeze

  def initialize(user:, message:)
    @user = user
    @message = message.to_s.downcase.strip
  end

  def call
    clips =
      @user.clips
           .active
           .where(created_at: Time.zone.now.beginning_of_day..Time.zone.now.end_of_day)
           .order(created_at: :desc)
           .limit(80)
           .to_a
           .reject { |clip| ignored?(clip) }

    return "No clips found for today yet." if clips.empty?

    if @message.match?(/learn|today|summary/)
      today_summary(clips)
    else
      search_summary(clips)
    end
  end

  private

  def ignored?(clip)
    text = clip.content.to_s.downcase
    IGNORE_PATTERNS.any? { |pattern| text.include?(pattern) }
  end

  def today_summary(clips)
    tags =
      clips
        .flat_map { |clip| Array(clip.tags) }
        .compact
        .group_by(&:itself)
        .transform_values(&:count)
        .sort_by { |_, count| -count }
        .first(5)
        .map(&:first)

    recent =
      clips.first(6).map { |clip| "• #{memory_title(clip)}" }

    <<~TEXT
      Today you focused on:

      #{tags.map { |tag| "• #{tag}" }.join("\n")}

      Recent learning:

      #{recent.join("\n")}
    TEXT
  end

  def search_summary(clips)
    keywords = @message.scan(/[a-z0-9_]+/)

    matches =
      clips.select do |clip|
        text = [
          clip.content,
          clip.title,
          clip.page_title,
          Array(clip.tags).join(" ")
        ].join(" ").downcase

        keywords.any? { |word| text.include?(word) }
      end

    return today_summary(clips) if matches.empty?

    result =
      matches.first(6).map { |clip| "• #{memory_title(clip)}" }

    <<~TEXT
      Found #{matches.count} related memories:

      #{result.join("\n")}
    TEXT
  end

  def memory_title(clip)
    content = clip.content.to_s.squish

    return content.truncate(90) if content.present?

    clip.page_title.presence || "Untitled memory"
  end
end