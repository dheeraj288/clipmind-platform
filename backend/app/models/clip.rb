class Clip < ApplicationRecord
before_create :set_defaults
after_create_commit :broadcast_new_clip
  

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
end




