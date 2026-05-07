class CreateCourseProgresses < ActiveRecord::Migration[8.1]
  def change
    create_table :course_progresses do |t|
      t.references :user, null: false, foreign_key: true
      t.references :course, null: false, foreign_key: true

      t.timestamps
    end
  end
end
