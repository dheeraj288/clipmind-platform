class CreateClipCopyLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :clip_copy_logs do |t|
      t.references :clip, null: false, foreign_key: true
      t.references :user, null: true, foreign_key: true

      t.timestamps
    end

    add_index :clip_copy_logs, :created_at
  end
end
