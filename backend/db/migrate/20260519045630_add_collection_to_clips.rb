class AddCollectionToClips < ActiveRecord::Migration[7.1]
  def change
    add_reference :clips, :collection, null: true, foreign_key: true
  end
end
