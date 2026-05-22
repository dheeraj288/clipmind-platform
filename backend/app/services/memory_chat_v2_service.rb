class MemoryChatV2Service
  STOP_WORDS = %w[
    what did i me my you your today yesterday this that about tell show find
    clips clip memory memories learn learned learning related please
  ].freeze

  def initialize(user:, message:)
    @user = user
    @message = message.to_s.downcase.strip
  end

  def call
    clips = filtered_clips

    return "No matching memories found yet." if clips.empty?

    if summary_question?
      build_summary(clips)
    else
      build_search_result(clips)
    end
  end

  private

  def filtered_clips
    scope = @user.clips.active.includes(:collection)

    scope = apply_time_filter(scope)
    scope = scope.where(is_favorite: true) if @message.include?("favorite")
    scope = scope.where(clip_type: "code") if @message.include?("code")
    scope = scope.where(clip_type: "link") if @message.include?("link")

    clips = scope.order(created_at: :desc).limit(150).to_a
    keywords = extract_keywords

    return clips.first(40) if keywords.empty?

    ranked =
      clips.map do |clip|
        [clip, score_clip(clip, keywords)]
      end

    ranked
      .select { |_, score| score.positive? }
      .sort_by { |clip, score| [-score, -clip.created_at.to_i] }
      .map(&:first)
      .first(20)
  end

  def apply_time_filter(scope)
    now = Time.zone.now

    if @message.include?("yesterday")
      scope.where(created_at: now.yesterday.beginning_of_day..now.yesterday.end_of_day)
    elsif @message.include?("week") || @message.include?("last 7 days")
      scope.where(created_at: 7.days.ago..now)
    elsif @message.include?("today")
      scope.where(created_at: now.beginning_of_day..now.end_of_day)
    else
      scope.where(created_at: 30.days.ago..now)
    end
  end

  def extract_keywords
    @message
      .scan(/[a-z0-9_]{3,}/)
      .reject { |word| STOP_WORDS.include?(word) }
      .uniq
  end

  def score_clip(clip, keywords)
    text = [
      clip.title,
      clip.content,
      clip.page_title,
      clip.source_url,
      clip.clip_type,
      clip.language,
      clip.collection&.name,
      Array(clip.tags).join(" ")
    ].join(" ").downcase

    score = 0

    keywords.each do |word|
      score += 5 if text.include?(word)
      score += 3 if Array(clip.tags).map(&:to_s).any? { |tag| tag.downcase.include?(word) }
      score += 2 if clip.collection&.name.to_s.downcase.include?(word)
    end

    score += 2 if clip.is_favorite?
    score += 2 if clip.copy_count.to_i > 0
    score += 1 if clip.created_at > 3.days.ago

    score
  end

  def summary_question?
    @message.match?(/summary|summarize|learn|today|week|insight|recap/)
  end

  def build_summary(clips)
    tags = top_tags(clips)
    collections = top_collections(clips)
    types = top_types(clips)
    recent = clips.first(7).map { |clip| "• #{clip_title(clip)}" }

    <<~TEXT
      Smart Memory Summary

      Top topics:
      #{tags.any? ? tags.map { |tag| "• #{tag}" }.join("\n") : "• No strong tags yet"}

      Collections:
      #{collections.any? ? collections.map { |name| "• #{name}" }.join("\n") : "• No collection pattern found"}

      Clip types:
      #{types.any? ? types.map { |type| "• #{type}" }.join("\n") : "• No clip type pattern found"}

      Recent useful memories:
      #{recent.join("\n")}
    TEXT
  end

  def build_search_result(clips)
    result =
      clips.first(8).map.with_index(1) do |clip, index|
        "#{index}. #{clip_title(clip)}"
      end

    <<~TEXT
      Found #{clips.count} related memories:

      #{result.join("\n")}
    TEXT
  end

  def top_tags(clips)
    clips
      .flat_map { |clip| Array(clip.tags) }
      .compact
      .map(&:to_s)
      .reject(&:blank?)
      .group_by(&:itself)
      .transform_values(&:count)
      .sort_by { |_, count| -count }
      .first(6)
      .map(&:first)
  end

  def top_collections(clips)
    clips
      .map { |clip| clip.collection&.name }
      .compact
      .reject(&:blank?)
      .group_by(&:itself)
      .transform_values(&:count)
      .sort_by { |_, count| -count }
      .first(5)
      .map(&:first)
  end

  def top_types(clips)
    clips
      .map(&:clip_type)
      .compact
      .reject(&:blank?)
      .group_by(&:itself)
      .transform_values(&:count)
      .sort_by { |_, count| -count }
      .first(5)
      .map { |type, count| "#{type} — #{count}" }
  end

  def clip_title(clip)
    title =
      clip.page_title.presence ||
      clip.title.presence ||
      clip.content.to_s.squish.truncate(90)

    meta = []
    meta << clip.collection.name if clip.collection.present?
    meta << clip.clip_type if clip.clip_type.present?

    meta.any? ? "#{title} (#{meta.join(' • ')})" : title
  end
end