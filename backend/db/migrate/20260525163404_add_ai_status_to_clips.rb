class AddAiStatusToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :ai_status, :string
    add_column :clips, :ai_error, :text
  end
end
