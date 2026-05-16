class CreateClips < ActiveRecord::Migration[7.1]
  def change
    create_table :clips do |t|
      t.string :title
      t.text :content
      t.datetime :copied_at
      t.string :source
      t.boolean :is_favorite
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
