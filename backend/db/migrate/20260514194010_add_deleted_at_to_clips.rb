class AddDeletedAtToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :deleted_at, :datetime
  end
end
