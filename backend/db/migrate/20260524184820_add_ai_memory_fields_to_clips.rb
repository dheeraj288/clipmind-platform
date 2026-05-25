class AddAiMemoryFieldsToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :ai_memory, :boolean
    add_column :clips, :ai_memory_saved_at, :datetime
  end
end
