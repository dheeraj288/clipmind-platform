class AddPinnedToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :is_pinned, :boolean, default: false
  end
end