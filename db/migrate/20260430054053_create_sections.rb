class CreateSections < ActiveRecord::Migration[8.1]
  def change
    create_table :sections do |t|
      t.string :section_name
      t.references :course, null: false, foreign_key: true

      t.timestamps
    end
  end
end
