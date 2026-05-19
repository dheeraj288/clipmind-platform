class AddTagsToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :tags, :jsonb, default: [], null: false
    add_index :clips, :tags, using: :gin
  end
end