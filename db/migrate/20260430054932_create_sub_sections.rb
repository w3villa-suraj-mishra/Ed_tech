class CreateSubSections < ActiveRecord::Migration[8.1]
  def change
    create_table :sub_sections do |t|
      t.string :title
      t.string :time_duration
      t.text :description
      t.string :video_url
      t.references :section, null: false, foreign_key: true

      t.timestamps
    end
  end
end
