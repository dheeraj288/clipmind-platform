class AiMemoryScoreService

  def initialize(clip)
    @clip = clip
  end

  def call
    score = 0

    score += favorite_score
    score += copy_score
    score += recent_copy_score
    score += recent_create_score
    score += collection_score

    score
  end

  private

  attr_reader :clip

  def favorite_score
    clip.is_favorite? ? 100 : 0
  end

  def copy_score
    clip.copy_count.to_i * 8
  end

  def recent_copy_score
    return 0 if clip.copied_at.blank?

    hours =
      (Time.current - clip.copied_at) / 1.hour

    return 50 if hours <= 24
    return 25 if hours <= 72

    0
  end

  def recent_create_score
    return 0 if clip.created_at.blank?

    hours =
      (Time.current - clip.created_at) / 1.hour

    hours <= 24 ? 30 : 0
  end

  def collection_score
    clip.collection_id.present? ? 20 : 0
  end
end