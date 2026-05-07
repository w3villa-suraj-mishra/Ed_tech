class CreateCourses < ActiveRecord::Migration[8.1]
  def change
    create_table :courses do |t|
      t.string :course_name
      t.text :course_description
      t.text :what_you_will_learn
      t.integer :price
      t.string :thumbnail
      t.string :tag
      t.string :status
      t.references :instructor, null: false, foreign_key: { to_table: :users }
      t.references :category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
