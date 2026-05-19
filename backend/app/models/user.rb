class User < ApplicationRecord
  has_secure_password

  has_many :clips, dependent: :destroy
  has_many :collections, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
end