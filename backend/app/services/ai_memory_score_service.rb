class AiMemoryScoreService

  def initialize(clip)
    @clip = clip
    @reasons = []
  end

  def call
    score = 0

    score += favorite_score
    score += copy_score
    score += recent_copy_score
    score += recent_create_score
    score += collection_score

    {
      score: score,
      reasons: @reasons
    }
  end

  private

  attr_reader :clip

  def favorite_score
    return 0 unless clip.is_favorite?

    @reasons << {
      label: "Favorite",
      icon: "⭐",
      points: 100
    }

    100
  end

  def copy_score
    copies =
      clip.copy_count.to_i

    return 0 if copies.zero?

    points =
      copies * 8

    @reasons << {
      label: "#{copies} copies",
      icon: "📋",
      points: points
    }

    points
  end

  def recent_copy_score
    return 0 if clip.copied_at.blank?

    hours =
      (Time.current - clip.copied_at) / 1.hour

    if hours <= 24

      @reasons << {
        label: "Copied today",
        icon: "🕒",
        points: 50
      }

      return 50

    elsif hours <= 72

      @reasons << {
        label: "Recently copied",
        icon: "🕒",
        points: 25
      }

      return 25
    end

    0
  end

  def recent_create_score
    return 0 if clip.created_at.blank?

    hours =
      (Time.current - clip.created_at) / 1.hour

    return 0 unless hours <= 24

    @reasons << {
      label: "Created today",
      icon: "✨",
      points: 30
    }

    30
  end

  def collection_score
    return 0 if clip.collection_id.blank?

    @reasons << {
      label: "In collection",
      icon: "📚",
      points: 20
    }

    20
  end
end