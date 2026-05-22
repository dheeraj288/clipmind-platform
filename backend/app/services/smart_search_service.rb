class SmartSearchService
  SYNONYMS = {
    "auth" => %w[authentication login logout password token jwt devise session],
    "user" => %w[user account profile member customer],
    "api" => %w[api json endpoint controller request response fetch],
    "database" => %w[sql query table migration model active_record postgres mysql],
    "frontend" => %w[html css tailwind javascript react vue component],
    "rails" => %w[ruby rails active_record controller model migration routes],
    "react" => %w[react jsx component usestate useeffect props state],
    "docker" => %w[docker dockerfile compose container image],
    "git" => %w[git github commit branch push pull merge]
  }.freeze

  def initialize(user:, query:)
    @user = user
    @query = query.to_s.downcase.strip
  end

  def call
    return @user.clips.active.order(created_at: :desc) if @query.blank?

    words = expanded_words

    clips = @user.clips.active.limit(300).to_a

    ranked = clips.map do |clip|
      score = score_clip(clip, words)
      [clip, score]
    end

    ranked
      .select { |_, score| score.positive? }
      .sort_by { |clip, score| [-score, -clip.created_at.to_i] }
      .map(&:first)
  end

  private

  def expanded_words
    base = @query.scan(/[a-z0-9_]+/)

    extra = base.flat_map do |word|
      SYNONYMS[word] || []
    end

    (base + extra).uniq
  end

  def score_clip(clip, words)
    text = [
      clip.title,
      clip.content,
      clip.page_title,
      clip.page_description,
      clip.site_name,
      Array(clip.tags).join(" ")
    ].join(" ").downcase

    score = 0

    words.each do |word|
      score += 8 if Array(clip.tags).map(&:to_s).include?(word)
      score += 5 if clip.title.to_s.downcase.include?(word)
      score += 4 if clip.page_title.to_s.downcase.include?(word)
      score += 2 if text.include?(word)
    end

    score += 2 if clip.is_favorite?
    score += 2 if clip.is_pinned?

    score
  end
end