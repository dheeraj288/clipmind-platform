class Clip < ApplicationRecord
before_create :set_defaults
after_create_commit :broadcast_new_clip
after_create_commit :auto_assign_collection
  

  belongs_to :user
  belongs_to :collection, optional: true

  has_many :clip_copy_logs, dependent: :destroy

  scope :most_used, -> { order(copy_count: :desc) }

  validates :content, presence: true

  scope :active, -> {
      where(deleted_at: nil)
    }

    scope :trending, -> {

      left_joins(:clip_copy_logs)
        .group("clips.id")
        .order(
          Arel.sql(
            "
              COUNT(
                CASE
                  WHEN clip_copy_logs.created_at >= NOW() - INTERVAL '7 days'
                  THEN 1
                END
              ) * 5
              +
              clips.copy_count * 2 DESC
            "
          )
        )

    }

   enum clip_type: {
    text: "text",
    code: "code",
    link: "link",
    email: "email",
    json: "json",
    command: "command"
  }

  def set_defaults
    self.copy_count ||= 0
    self.is_favorite ||= false
    self.deleted_at = nil
  end

  def related(limit = 5)
  tag_values =
    if tags.is_a?(Array)
      tags
    elsif tags.is_a?(Hash)
      tags.values.flatten
    else
      []
    end

  tag_values = tag_values.compact.map(&:to_s).uniq

  words =
    content.to_s
           .downcase
           .scan(/[a-z0-9_]{4,}/)
           .uniq
           .first(8)

  base =
    self.class
        .active
        .where(user_id: user_id)
        .where.not(id: id)

  candidates =
    base
      .limit(80)
      .to_a

  ranked =
    candidates.map do |candidate|
      score = 0

      candidate_tags =
        if candidate.tags.is_a?(Array)
          candidate.tags
        elsif candidate.tags.is_a?(Hash)
          candidate.tags.values.flatten
        else
          []
        end

      candidate_tags = candidate_tags.compact.map(&:to_s).uniq

      matched_tags = tag_values & candidate_tags
      score += matched_tags.size * 5

      if collection_id.present? && candidate.collection_id == collection_id
        score += 4
      end

      if clip_type.present? && candidate.clip_type == clip_type
        score += 2
      end

      candidate_words =
        candidate.content.to_s
                 .downcase
                 .scan(/[a-z0-9_]{4,}/)
                 .uniq

      matched_words = words & candidate_words
      score += matched_words.size

      score += 1 if candidate.created_at > 7.days.ago

      [candidate, score]
    end

  ranked
    .select { |_, score| score.positive? }
    .sort_by { |candidate, score| [-score, -candidate.created_at.to_i] }
    .map(&:first)
    .first(limit)
end

  private

  def broadcast_new_clip
    broadcast_prepend_to(
      "user_#{user_id}_clips",
      target: "clips_list_items",
      partial: "shared/clip_card",
      locals: {
        clip: self,
        collections: user.collections.order(:name)
      }
    )
  end

  def auto_assign_collection
    return if collection_id.present?

    AutoCollectionService.new(
      user: user,
      clip: self
    ).call
  end
end




