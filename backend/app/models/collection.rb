class Collection < ApplicationRecord
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
end