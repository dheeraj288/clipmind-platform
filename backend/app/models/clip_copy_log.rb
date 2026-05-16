class ClipCopyLog < ApplicationRecord
  belongs_to :clip
  belongs_to :user, optional: true
end