class CourseProgressVideo < ApplicationRecord
  belongs_to :course_progress
  belongs_to :sub_section
end
