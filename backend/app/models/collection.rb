class Collection < ApplicationRecord
  before_create :set_defaults

  belongs_to :user

  has_many :clips,
           dependent: :nullify

  validates :name,
            presence: true,
            length: { maximum: 80 }

      def clips_count
        self[:clips_count].to_i
      end

      def total_copies
        self[:total_copies].to_i
      end

      def set_defaults
        self.is_pinned = false if is_pinned.nil?
      end
end


