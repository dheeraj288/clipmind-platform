class Clip < ApplicationRecord
before_create :set_defaults
  

  belongs_to :user

  has_many :clip_copy_logs, dependent: :destroy

  scope :most_used, -> { order(copy_count: :desc) }
  scope :trending, -> { order(copy_count: :desc).limit(10) }

  validates :content, presence: true

  scope :active, -> {
    where(deleted_at: nil)
  }

  scope :most_used, -> { order(copy_count: :desc) }
  scope :trending, -> { order(copy_count: :desc).limit(10) }

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
  end

end




