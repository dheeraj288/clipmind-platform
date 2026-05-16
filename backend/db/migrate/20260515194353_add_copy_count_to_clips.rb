class AddCopyCountToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :copy_count, :integer, default: 0, null: false
    add_index :clips, :copy_count
  end
end
