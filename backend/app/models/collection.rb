class Collection < ApplicationRecord
  belongs_to :user

  has_many :clips,
           dependent: :nullify

  validates :name,
            presence: true,
            length: { maximum: 80 }
end