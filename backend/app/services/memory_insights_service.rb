class MemoryInsightsService
  def initialize(user)
    @user = user
    @clips =
      user.clips
          .active
          .where(
            created_at:
            Time.zone.now.beginning_of_day..
            Time.zone.now.end_of_day
          )
  end

  def call
    {
      total_clips: total_clips,
      top_tags: top_tags,
      top_category: top_category,
      peak_time: peak_time,
      learning_pattern: learning_pattern
    }
  end

  private

  def total_clips
    @clips.count
  end

  def top_tags
    @clips
      .pluck(:tags)
      .flatten
      .compact
      .group_by(&:itself)
      .transform_values(&:count)
      .sort_by { |_,count| -count }
      .first(3)
      .map(&:first)
  end

  def top_category
    @clips
      .group(:clip_type)
      .count
      .max_by(&:last)
      &.first || "none"
  end

  def peak_time
    hour =
      @clips
        .group_by { |c| c.created_at.hour }
        .max_by { |_,v| v.size }
        &.first

    return "No activity" unless hour

    "#{hour}:00 - #{hour+1}:00"
  end

  def learning_pattern
    tags = top_tags.join(" + ")

    return "No activity yet" if tags.blank?

    "Mostly #{tags} today"
  end
end