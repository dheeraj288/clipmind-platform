class AddPinnedToCollections < ActiveRecord::Migration[7.1]
  def change
    add_column :collections, :is_pinned, :boolean, default: false, null: false
  end
end