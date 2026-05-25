class AddAiSummaryToClips < ActiveRecord::Migration[7.1]
  def change
    add_column :clips, :ai_summary, :text
    add_column :clips, :ai_summary_generated_at, :datetime
  end
end
