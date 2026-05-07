class CreateCourseProgressVideos < ActiveRecord::Migration[8.1]
  def change
    create_table :course_progress_videos do |t|
      t.references :course_progress, null: false, foreign_key: true
      t.references :sub_section, null: false, foreign_key: true

      t.timestamps
    end
  end
end
